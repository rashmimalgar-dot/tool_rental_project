from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
# ⭐ Real-time imports
from flask_socketio import SocketIO, emit, join_room, leave_room 
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
import random
from datetime import datetime
import os
import traceback 

from dotenv import load_dotenv

load_dotenv()

# ------------------ Flask App & SocketIO Config ------------------
app = Flask(__name__)
# ⭐ Initialize SocketIO with CORS enabled
socketio = SocketIO(app, cors_allowed_origins="*") 
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True) 

# ------------------ File Upload Config ------------------
UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ------------------ MySQL Config ------------------
from dotenv import load_dotenv
load_dotenv()

db_config = {
    'user': 'root',
    'password': '', 
    'host': 'localhost',
    'database': 'toolrental'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# ------------------ Mail Config ------------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

mail = Mail(app)

verification_codes = {}
reset_allowed = {}

# ------------------ File Serving ------------------
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# =========================================================================
# ------------------ SOCKET.IO REAL-TIME HANDLERS ------------------
# =========================================================================

@socketio.on('join')
def on_join(data):
    """Client connects and joins a unique room based on their user ID."""
    user_id = data.get('user_id')
    if user_id:
        # Room name format must match client's format: user_ID
        room = f'user_{user_id}' 
        join_room(room)
        print(f"User {user_id} joined SocketIO room: {room}")

# =========================================================================
# ------------------ UTILITY FUNCTIONS ------------------
# =========================================================================

def get_user_full_name(user_id):
    """Retrieves the full name of a user by their ID."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT full_name FROM users WHERE user_id=%s", (user_id,))
        user = cursor.fetchone()
        return user['full_name'] if user else "Unknown User"
    except Exception as e:
        print(f"ERROR in get_user_full_name for ID {user_id}: {e}")
        return "Unknown User (Error)"
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_tool_name(tool_id):
    """Retrieves the name of a tool by its ID."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT name FROM tools WHERE item_id=%s", (tool_id,))
        tool = cursor.fetchone()
        return tool['name'] if tool else "Unknown Tool"
    except Exception as e:
        print(f"ERROR in get_tool_name for ID {tool_id}: {e}")
        return "Unknown Tool (Error)"
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def create_notification(user_id, sender_id, related_type, related_id, title, message, notification_type):
    """Inserts a new notification into the database and returns the notification ID."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # NOTE: Using 'notification' (singular) as per schema and keeping fields generic
        query = """
        INSERT INTO notification (user_id, sender_id, related_type, related_id, title, message, type, is_read)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 0)
        """
        params = (user_id, sender_id, related_type, related_id, title, message, notification_type)
        cursor.execute(query, params)
        conn.commit()
        return cursor.lastrowid
    except mysql.connector.Error as err:
        print(f"MYSQL ERROR in create_notification: {err}")
        return None
    except Exception as e:
        print(f"ERROR in create_notification: {e}")
        return None
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass

# =========================================================================
# ------------------ NOTIFICATION SETTINGS ENDPOINTS ------------------
# =========================================================================

# ROUTE FIX: Removed /api/ prefix
@app.route('/settings/notifications/<int:user_id>', methods=['GET'])
def get_notification_settings(user_id):
    """Fetches a user's current notification preferences from user_settings."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM user_settings WHERE user_id=%s", (user_id,))
        settings = cursor.fetchone()
        
        if settings:
            return jsonify({
                "email": bool(settings.get('email_enabled', True)),
                "sms": bool(settings.get('sms_enabled', False)),
                "app": bool(settings.get('app_enabled', True)),
                "dnd": bool(settings.get('dnd_enabled', False)),
            }), 200
        else:
            return jsonify({
                "email": True, "sms": False, "app": True, "dnd": False
            }), 200

    except Exception:
        print("ERROR in get_notification_settings:", traceback.format_exc())
        return jsonify({"error": "Failed to fetch settings"}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass

# ROUTE FIX: Removed /api/ prefix
@app.route('/settings/notifications', methods=['POST'])
def save_notification_settings():
    """Saves or updates a user's notification preferences using UPSERT logic."""
    conn = None
    cursor = None
    try:
        data = request.get_json()
        user_id = data.get('user_id') 
        
        if not user_id:
            return jsonify({"error": "User ID required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
        INSERT INTO user_settings (user_id, email_enabled, sms_enabled, app_enabled, dnd_enabled)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            email_enabled=VALUES(email_enabled),
            sms_enabled=VALUES(sms_enabled),
            app_enabled=VALUES(app_enabled),
            dnd_enabled=VALUES(dnd_enabled)
        """
        params = (
            user_id, 
            int(data.get('email', True)), 
            int(data.get('sms', False)), 
            int(data.get('app', True)), 
            int(data.get('dnd', False))
        )
        
        cursor.execute(query, params)
        conn.commit()
        
        return jsonify({"message": "Settings saved successfully"}), 200

    except Exception:
        print("ERROR in save_notification_settings:", traceback.format_exc())
        return jsonify({"error": "Failed to save settings"}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass

# =========================================================================
# ------------------ TOOL REQUEST & NOTIFICATION ENDPOINTS ------------------
# =========================================================================

@app.route('/request-tool', methods=['POST'])
def request_tool():
    """BORROWER requests a tool (creates notification for LENDER)."""
    conn = None
    cursor = None
    try:
        data = request.get_json()
        item_id = data.get('item_id')
        borrower_id = data.get('borrower_id')
        lender_id = data.get('lender_id')
        message = data.get('message', 'I would like to borrow this tool.')

        if not all([item_id, borrower_id, lender_id]):
            return jsonify({"error": "Missing item ID, borrower ID, or lender ID"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. FIX: Ensure table name is PLURAL: tool_requests
        # NOTE: Status is ENUM('pending', 'Accepted', 'Rejected')
        cursor.execute("""
            INSERT INTO tool_requests (item_id, borrower_id, lender_id, message, status) 
            VALUES (%s, %s, %s, %s, 'pending')
        """, (item_id, borrower_id, lender_id, message))
        
        request_id = cursor.lastrowid
        
        # 2. Create NOTIFICATION for the LENDER
        borrower_name = get_user_full_name(borrower_id)
        tool_name = get_tool_name(item_id)
        
        create_notification(
            user_id=lender_id, 	# Recipient (Lender)
            sender_id=borrower_id, 	# Sender (Borrower)
            related_type='request',
            related_id=request_id,
            title="New Tool Request Received! 🛎️",
            message=f"{borrower_name} has requested your tool: {tool_name}. Message: '{message}'",
            notification_type='info'
        )

        conn.commit()
        
        return jsonify({"message": "Tool request sent successfully to the lender.", "request_id": request_id}), 201

    except mysql.connector.Error as err:
        print("MYSQL ERROR:", traceback.format_exc())
        if conn: conn.rollback()
        return jsonify({"error": f"Database error during request. ({str(err)})"}), 500
    except Exception as e:
        print(f"GENERAL ERROR (request_tool): {e}")
        if conn: conn.rollback()
        return jsonify({"error": "Failed to send tool request due to server error."}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass


@app.route('/handle-borrow-request/<int:request_id>', methods=['PUT']) 
def handle_tool_request(request_id):
    """LENDER accepts/rejects a request (notifies BORROWER via DB & SocketIO)."""
    conn = None
    cursor = None
    try:
        data = request.get_json()
        action = data.get('action') 
        lender_id = data.get('lender_id')
        custom_message = data.get('message', '')

        if not lender_id or action not in ['accept', 'reject']:
            return jsonify({"error": "Invalid action or authentication required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT borrower_id, item_id, lender_id FROM tool_requests WHERE request_id=%s", 
            (request_id,)
        )
        request_details = cursor.fetchone()
        
        if not request_details:
            return jsonify({"error": "Request not found"}), 404
        
        if request_details['lender_id'] != lender_id:
            return jsonify({"error": "Unauthorized action"}), 403
            
        borrower_id = request_details['borrower_id']
        item_id = request_details['item_id']
        tool_name = get_tool_name(item_id)
        borrower_room = f'user_{borrower_id}'

        if action == 'accept':
            status = 'approved'
            title = "Request Approved! 🎉"
            message = f"Your request for {tool_name} has been approved by the lender."
            if custom_message:
                message += f" Message from lender: '{custom_message}'"
            notification_type = 'success'
            cursor.execute("UPDATE tools SET availability='unavailable' WHERE item_id=%s", (item_id,)) 
            # Force update for consistency
            cursor.execute("UPDATE tool_requests SET status='approved' WHERE request_id=%s", (request_id,))

        elif action == 'reject':
            status = 'rejected'
            title = "Request Rejected 😔"
            message = f"Your request for {tool_name} was rejected by the lender."
            if custom_message:
                message += f" Message from lender: '{custom_message}'"
            notification_type = 'warning'
        
        cursor.execute(
            "UPDATE tool_requests SET status=%s, lender_message=%s WHERE request_id=%s",
            (status, custom_message, request_id)
        )
        conn.commit()

        db_notification_id = create_notification(
            user_id=borrower_id, 
            sender_id=lender_id, 
            related_type='borrow',
            related_id=item_id,
            title=title,
            message=message,
            notification_type=notification_type
        )
        
        socketio.emit('new_notification', {
            "type": notification_type,
            "title": title,
            "message": message,
            "tool_name": tool_name,
            "notification_id": db_notification_id,
            "timestamp": datetime.now().isoformat()
        }, room=borrower_room)

        return jsonify({"message": f"Request {action}ed. Borrower has been notified."}), 200

    except Exception:
        print("ERROR in handle-tool-request:", traceback.format_exc())
        if conn: conn.rollback()
        return jsonify({"error": "Failed to process request"}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass

@app.route('/get-borrow-requests/<int:lender_id>', methods=['GET'])
def get_borrow_requests(lender_id):
    """Fetches all requests pending for a specific lender (Lender Dashboard)."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT tr.request_id, tr.item_id, tr.borrower_id, tr.status, tr.message, tr.request_date AS created_at,
                u.full_name AS borrower_name, u.phone AS borrower_phone
        FROM tool_requests tr
        JOIN users u ON tr.borrower_id = u.user_id
        WHERE tr.lender_id = %s
        ORDER BY tr.request_date DESC
        """
        cursor.execute(query, (lender_id,))
        requests = cursor.fetchall()

        return jsonify(requests), 200
    
    except Exception:
        print("ERROR in get_borrow_requests:", traceback.format_exc())
        return jsonify({"error": "Failed to fetch borrow requests"}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass


@app.route('/mark-returned/<int:request_id>', methods=['PUT'])
def mark_tool_returned(request_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "UPDATE tool_requests SET return_status='returned' WHERE request_id=%s",
            (request_id,)
        )
        conn.commit()
        return jsonify({"message": "Tool marked as returned successfully."}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    """Borrower submits feedback after returning the tool."""
    conn = None
    cursor = None
    try:
        data = request.get_json()
        print("\n📩 Received Feedback Data:", data)  # 👈 LOG incoming payload

        user_id = data.get('user_id')          # The LENDER who owns the tool
        from_user_id = data.get('from_user_id') # The BORROWER giving feedback
        item_id = data.get('item_id')
        borrow_id = data.get('borrow_id')
        rating = data.get('rating')
        comments = data.get('comments', '')

        # 🔎 Log for debugging
        print(f"user_id={user_id}, from_user_id={from_user_id}, item_id={item_id}, borrow_id={borrow_id}, rating={rating}")

        if not all([user_id, from_user_id, item_id, borrow_id, rating]):
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Prevent duplicate feedback (optional)
        cursor.execute("""
            SELECT feedback_id FROM feedback 
            WHERE from_user_id=%s AND item_id=%s AND borrow_id=%s
        """, (from_user_id, item_id, borrow_id))
        existing = cursor.fetchone()
        if existing:
            return jsonify({"error": "Feedback already submitted for this tool."}), 400

        # ✅ Insert feedback
        cursor.execute("""
            INSERT INTO feedback (user_id, from_user_id, item_id, borrow_id, rating, comments)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, from_user_id, item_id, borrow_id, rating, comments))
        conn.commit()

        print("✅ Feedback inserted successfully!")
        return jsonify({"message": "Feedback submitted successfully."}), 201

    except Exception as e:
        print("❌ ERROR in submit-feedback:", traceback.format_exc())  # 👈 SHOW full traceback
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
@app.route('/get-tool-reviews/<int:lender_id>', methods=['GET'])
def get_tool_reviews(lender_id):
    """Fetch feedback given to all tools owned by this lender."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                f.feedback_id,
                f.rating,
                f.comments,
                f.created_at,
                t.item_id,
                t.name AS tool_name,
                u.full_name AS borrower_name
            FROM feedback f
            JOIN tools t ON f.item_id = t.item_id
            JOIN users u ON f.from_user_id = u.user_id
            WHERE t.lender_id = %s
            ORDER BY f.created_at DESC
        """
        cursor.execute(query, (lender_id,))
        reviews = cursor.fetchall()

        return jsonify(reviews), 200

    except Exception as e:
        print("Error fetching tool reviews:", e)
        return jsonify({"error": "Failed to fetch tool reviews"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()




@app.route('/get-feedback/<int:item_id>', methods=['GET'])
def get_feedback(item_id):
    """Fetches all feedback for a specific tool."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT f.feedback_id, f.rating, f.comments, f.created_at,
                   u.full_name AS reviewer_name, u.user_id AS reviewer_id
            FROM feedback f
            JOIN users u ON f.from_user_id = u.user_id
            WHERE f.item_id = %s
            ORDER BY f.created_at DESC
        """, (item_id,))
        feedbacks = cursor.fetchall()

        return jsonify(feedbacks), 200

    except Exception as e:
        print("ERROR in get-feedback:", e)
        return jsonify({"error": "Failed to fetch feedback"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
@app.route('/borrowed-tools/<int:borrower_id>', methods=['GET'])
def get_borrowed_tools(borrower_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                tr.request_id,
                tr.item_id,
                tr.lender_id,          -- ✅ Needed for feedback submission
                tr.status,
                tr.return_status,
                t.name AS name,
                t.description,
                t.rent_fee,
                u.full_name AS lender_name,
                (
                    SELECT COUNT(*) FROM feedback f 
                    WHERE f.borrow_id = tr.request_id 
                      AND f.from_user_id = tr.borrower_id
                ) AS has_review
            FROM tool_requests tr
            JOIN tools t ON tr.item_id = t.item_id
            JOIN users u ON tr.lender_id = u.user_id
            WHERE tr.borrower_id = %s
            ORDER BY tr.request_id DESC
        """
        cursor.execute(query, (borrower_id,))
        borrowed_tools = cursor.fetchall()

        # ✅ Fetch images for each tool
        for b in borrowed_tools:
            cursor.execute("SELECT image_url FROM tool_images WHERE item_id = %s", (b["item_id"],))
            images = cursor.fetchall()
            b["images"] = [os.path.basename(img["image_url"]) for img in images]
            b["has_review"] = bool(b["has_review"])

        return jsonify(borrowed_tools), 200

    except Exception as e:
        print("Error fetching borrowed tools:", e)
        return jsonify({"error": "Failed to load borrowed tools"}), 500
    finally:
        cursor.close()
        conn.close()





# ROUTE FIX: Removed /api/ prefix
@app.route('/get-notifications/<int:user_id>', methods=['GET'])
def get_user_notifications_api(user_id):
    """Fetches all historical notifications for a user."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # NOTE: Using 'notification' (singular) as per schema
        notifications_query = """
        SELECT notification_id, user_id, sender_id, related_type, related_id, title, message, type, is_read, created_at
        FROM notification 
        WHERE user_id = %s 
        ORDER BY created_at DESC
        """
        cursor.execute(notifications_query, (user_id,))
        notifications = cursor.fetchall()
        
        # Ensure 'is_read' is boolean for React frontend
        for notif in notifications:
            notif['is_read'] = bool(notif['is_read'])
        
        return jsonify(notifications), 200

    except Exception:
        print("ERROR in get_user_notifications:", traceback.format_exc())
        return jsonify({"error": "Failed to fetch notifications"}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass


# ROUTE FIX: Removed /api/ prefix
@app.route('/mark-read/<int:user_id>', methods=['PUT'])
def mark_notifications_as_read_api(user_id):
    """Marks all unread notifications for a user as read."""
    conn = None
    cursor = None
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE notification SET is_read = 1 WHERE user_id = %s AND is_read = 0", (user_id,))
        conn.commit()
        
        return jsonify({"message": "Notifications marked as read"}), 200
        
    except Exception:
        print("ERROR in mark_notifications_as_read:", traceback.format_exc())
        return jsonify({"error": "Failed to mark notifications as read"}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass


# =========================================================================
# ------------------ TOOL FETCHING ENDPOINTS ------------------
# =========================================================================

# 🎯 NEW ROUTE: Get ALL Available Tools for Borrowers
# This is the route your frontend should call to show all items to everyone.
@app.route('/get-tools', methods=['GET'])
def get_all_available_tools_for_borrower():
    """Fetches all tools marked as 'Available' for any user to borrow."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query for all available tools
        # IMPORTANT: Assuming 'tools' table uses 'availability' column to denote status
        cursor.execute("SELECT * FROM tools WHERE availability='Available'")
        tools = cursor.fetchall()

        # Fetch images for each tool
        for tool in tools:
            cursor.execute("SELECT image_url FROM tool_images WHERE item_id=%s", (tool['item_id'],))
            images = cursor.fetchall()
            # Extract just the filename for the frontend (consistent with existing logic)
            tool['images'] = [os.path.basename(img['image_url']) for img in images]

        return jsonify(tools), 200

    except Exception:
        print("ERROR in get_all_available_tools_for_borrower:", traceback.format_exc())
        return jsonify({"error": "Failed to fetch all available tools"}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass


# ------------------ Get Tools by Lender (Existing route, kept for Lender Dashboard) ------------------
@app.route('/get-tools/<int:lender_id>', methods=['GET'])
def get_tools(lender_id):
    """Fetches tools *owned* by a specific lender."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tools WHERE lender_id=%s", (lender_id,))
        tools = cursor.fetchall()

        for tool in tools:
            cursor.execute("SELECT image_url FROM tool_images WHERE item_id=%s", (tool['item_id'],))
            images = cursor.fetchall()
            tool['images'] = [os.path.basename(img['image_url']) for img in images]

        return jsonify(tools)

    except Exception as e:
        print("ERROR in get-tools:", e)
        return jsonify({"error": "Failed to fetch tools"}), 500
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


# ------------------ EXISTING ENDPOINTS (UNCHANGED) ------------------


# ------------------ Signup ------------------
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        phone = data.get('phone')
        dob = data.get('dob')
        address = data.get('address')
        city = data.get('city')
        area = data.get('area')
        pincode = data.get('pincode')

        if not username or not email or not password or not full_name:
            return jsonify({"error": "Username, email, full name, and password are required"}), 400

        # Convert empty strings to None for optional fields
        phone = phone if phone else None
        dob = dob if dob else None
        address = address if address else None
        city = city if city else None
        area = area if area else None
        pincode = pincode if pincode else None

        hashed_pw = generate_password_hash(password)

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email=%s OR username=%s", (email, username))
        if cursor.fetchone():
            return jsonify({"error": "Email or username already exists"}), 400

        try:
            cursor.execute("""
                INSERT INTO users (username, email, phone, password_hash, full_name, dob, address, city, area, pincode)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (username, email, phone, hashed_pw, full_name, dob, address, city, area, pincode))
            conn.commit()
            return jsonify({"message": "Signup successful!"}), 201
        except mysql.connector.Error as err:
            if err.errno == 1062:  # Duplicate entry
                if "users.phone" in str(err):
                    return jsonify({"error": "Phone number already in use"}), 400
                if "users.email" in str(err):
                    return jsonify({"error": "Email already in use"}), 400
                if "users.username" in str(err):
                    return jsonify({"error": "Username already in use"}), 400
            raise err

    except mysql.connector.Error as err:
        print("MYSQL ERROR:", err)
        return jsonify({"error": str(err)}), 400
    except Exception as e:
        print("ERROR:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass



# ------------------ Login ------------------
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1️⃣ Try regular user first
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        # 2️⃣ If not found, try admin table
        if not user:
            cursor.execute("SELECT * FROM admin WHERE email=%s", (email,))
            admin = cursor.fetchone()
            if admin:
                if check_password_hash(admin['password_hash'], password):
                    return jsonify({
                        "message": "Admin login successful",
                        "user": {
                            "admin_id": admin['admin_id'],
                            "email": admin['email'],
                            "full_name": admin['full_name'],
                        },
                        "is_admin": True
                    }), 200
                else:
                    return jsonify({"error": "Incorrect password"}), 401
            else:
                return jsonify({"error": "User not found"}), 404

        # ✅ 3️⃣ Check if user is blocked or deleted
        if user.get('is_blocked') == 1:
            return jsonify({"error": "Your account has been blocked by admin."}), 403
        if user.get('is_deleted') == 1:
            return jsonify({"error": "Your account has been deleted."}), 403

        # 4️⃣ If user found in `users`, validate password
        if check_password_hash(user['password_hash'], password):
            cursor.execute(
                "UPDATE users SET last_login_at=%s WHERE user_id=%s",
                (datetime.now(), user['user_id'])
            )
            conn.commit()

            return jsonify({
                "message": "User login successful",
                "user": {
                    "user_id": user['user_id'],
                    "username": user['username'],
                    "email": user['email'],
                    "full_name": user['full_name'],
                    "phone": user.get('phone'),
                    "address": user.get('address'),
                    "city": user.get('city'),
                    "area": user.get('area'),
                    "pincode": user.get('pincode')
                },
                "is_admin": False
            }), 200
        else:
            return jsonify({"error": "Incorrect password"}), 401

    except mysql.connector.Error as err:
        print("MYSQL ERROR:", err)
        return jsonify({"error": str(err)}), 500
    except Exception as e:
        import traceback
        print("ERROR traceback:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


@app.route("/update_profile", methods=["PUT"])
def update_profile():
    data = request.get_json()
    user_id = data.get("user_id")
    full_name = data.get("full_name")
    phone = data.get("phone")
    address = data.get("address")
    city = data.get("city")
    area = data.get("area")
    pincode = data.get("pincode")
    dob = data.get("dob")

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users
            SET full_name=%s, phone=%s, address=%s, city=%s, area=%s, pincode=%s, dob=%s, updated_at=NOW()
            WHERE user_id=%s
        """, (full_name, phone, address, city, area, pincode, dob, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        print("UPDATE PROFILE ERROR:", e)
        return jsonify({"error": str(e)}), 500


# ------------------ Add Tool ------------------
@app.route('/add-tool', methods=['POST'])
def add_tool():
    conn = None
    cursor = None
    try:
        # Get data from FormData (since client uses FormData for files)
        name = request.form.get("name")
        description = request.form.get("description")
        guidelines = request.form.get("guidelines")
        rent_fee = request.form.get("rent_fee")
        deposit_fee = request.form.get("deposit_fee")
        availability = request.form.get("availability")
        lender_id = request.form.get("lender_id")
        location_value = request.form.get("location")

        # Basic Validation: Check for required fields before connecting to DB
        if not all([name, description, rent_fee, deposit_fee, lender_id]):
            return jsonify({"error": "Missing required fields (name, description, fees, or lender ID)."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert Tool
        cursor.execute("""
            INSERT INTO tools (lender_id, name, description, tool_details, rent_fee, deposit_fee, availability, location)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (lender_id, name, description, guidelines, rent_fee, deposit_fee, availability, location_value))
        
        tool_id = cursor.lastrowid

        uploaded_files = []
        if 'images' in request.files:
            files = request.files.getlist('images')
            for f in files:
                filename = secure_filename(f.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                f.save(filepath)
                uploaded_files.append(filename)
                
                # Insert image mapping
                cursor.execute("INSERT INTO tool_images (item_id, image_url) VALUES (%s, %s)",
                               (tool_id, filepath))
        
        conn.commit() # Commit happens only if all insertions succeed

        return jsonify({
            "tool_id": tool_id, # CRITICAL: Frontend expects this key name
            "name": name,
            "description": description,
            "guidelines": guidelines,
            "rent_fee": rent_fee,
            "deposit_fee": deposit_fee,
            "availability": availability,
            "location": location_value,
            "images": uploaded_files
        }), 201

    except mysql.connector.Error as err:
        print("MYSQL ERROR in add_tool (Rolling back):", err)
        if conn: conn.rollback()
        return jsonify({"error": f"Database insertion failed: {str(err)}"}), 500
    except Exception as e:
        print("GENERAL ERROR in add_tool:", traceback.format_exc())
        if conn: conn.rollback()
        return jsonify({"error": "Failed to add tool due to server error"}), 500
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass

@app.route('/api/users', methods=['GET'])
def get_all_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        return jsonify(users), 200
    except Exception as e:
        print("Error fetching users:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ------------------ ADMIN: Block User ------------------
# ✅ BLOCK USER
# ✅ Block user
@app.route('/api/users/block/<int:user_id>', methods=['PUT', 'POST'])
def block_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_blocked = 1 WHERE user_id = %s", (user_id,))
        conn.commit()
        return jsonify({"message": "User blocked"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ✅ Unblock user
@app.route('/api/users/unblock/<int:user_id>', methods=['PUT', 'POST'])
def unblock_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_blocked = 0 WHERE user_id = %s", (user_id,))
        conn.commit()
        return jsonify({"message": "User unblocked"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ✅ Delete user
@app.route('/api/users/delete/<int:user_id>', methods=['DELETE', 'OPTIONS'])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_deleted = 1 WHERE user_id = %s", (user_id,))
        conn.commit()
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ------------------ Get Tool (Detail) ------------------
@app.route('/get-tool/<int:tool_id>', methods=['GET'])
def get_tool(tool_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch tool
        cursor.execute("SELECT * FROM tools WHERE item_id=%s", (tool_id,))
        tool = cursor.fetchone()
        if not tool:
            return jsonify({"error": "Tool not found"}), 404

        # Fetch tool images
        cursor.execute("SELECT image_url FROM tool_images WHERE item_id=%s", (tool_id,))
        images = cursor.fetchall()
        tool['images'] = [os.path.basename(img['image_url']) for img in images]

        # Fetch lender info from users table
        cursor.execute("SELECT full_name, phone, email, address FROM users WHERE user_id=%s", (tool['lender_id'],))
        lender = cursor.fetchone()
        
        total_tools = 0 
        
        if lender:
            # Count total tools by lender
            cursor.execute("SELECT COUNT(*) AS totalTools FROM tools WHERE lender_id=%s", (tool['lender_id'],))
            total_tools_result = cursor.fetchone() 
            
            # Safely retrieve the count
            if total_tools_result:
                 total_tools = total_tools_result.get('totalTools', 0)

            tool['lender'] = {
                "name": lender.get('full_name'),
                "contact": lender.get('phone'),
                "email": lender.get('email'),
                "address": lender.get('address'),
                "photo": None, 
                "totalTools": total_tools
            }

        return jsonify(tool), 200

    except Exception as e:
        print("ERROR:", e)
        print("ERROR traceback:", traceback.format_exc()) 
        return jsonify({"error": "Failed to fetch tool"}), 500
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


# ------------------ Delete Tool ------------------
@app.route('/delete-tool/<int:tool_id>', methods=['DELETE'])
def delete_tool(tool_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT image_url FROM tool_images WHERE item_id=%s", (tool_id,))
        images = cursor.fetchall()
        for (img_path,) in images:
            if os.path.exists(img_path):
                os.remove(img_path)

        cursor.execute("DELETE FROM tool_images WHERE item_id=%s", (tool_id,))
        cursor.execute("DELETE FROM tools WHERE item_id=%s", (tool_id,))
        conn.commit()

        return jsonify({"message": "Tool deleted successfully"}), 200

    except Exception as e:
        print("ERROR in delete-tool:", e)
        return jsonify({"error": "Failed to delete tool"}), 500
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


# ------------------ Update Tool ------------------
@app.route('/update-tool/<int:tool_id>', methods=['PUT'])
def update_tool(tool_id):
    try:
        name = request.form.get("name")
        description = request.form.get("description")
        guidelines = request.form.get("guidelines")
        rent_fee = request.form.get("rent_fee")
        deposit_fee = request.form.get("deposit_fee")
        availability = request.form.get("availability")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE tools
            SET name=%s, description=%s, tool_details=%s, rent_fee=%s, deposit_fee=%s, availability=%s
            WHERE item_id=%s
        """, (name, description, guidelines, rent_fee, deposit_fee, availability, tool_id))
        conn.commit()

        return jsonify({"message": "Tool updated successfully"}), 200

    except Exception as e:
        print("ERROR in update-tool:", e)
        return jsonify({"error": "Failed to update tool"}), 500
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


# ------------------ Forgot Password ------------------
@app.route('/send-code', methods=['POST'])
def send_code():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return jsonify({"error": "Email not registered"}), 404

    code = str(random.randint(100000, 999999))
    verification_codes[email] = code

    msg = Message("ToolShare Password Reset Code", recipients=[email])
    msg.body = f"Your password reset code is: {code}"
    try:
        mail.send(msg)
        return jsonify({"message": "Code sent"}), 200
    except Exception as e:
        print("MAIL SEND ERROR:", e)
        return jsonify({"error": "Failed to send email. Check mail configuration."}), 500


@app.route('/verify-code', methods=['POST'])
def verify_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    if verification_codes.get(email) == code:
        reset_allowed[email] = True
        return jsonify({"message": "Verified"}), 200
    return jsonify({"error": "Invalid code"}), 400


@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('password')
    if not reset_allowed.get(email):
        return jsonify({"error": "Verification required"}), 400

    new_password_hash = generate_password_hash(new_password)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash=%s WHERE email=%s", (new_password_hash, email))
    conn.commit()
    cursor.close()
    conn.close()

    reset_allowed.pop(email, None)
    verification_codes.pop(email, None)

    return jsonify({"message": "Password reset successful"}), 200


# ------------------ Home ------------------
@app.route("/")
def home():
    return "Flask backend is running with SocketIO and Notifications APIs!"


if __name__ == "__main__":
    try:
        # ⭐ IMPORTANT: Use socketio.run() instead of app.run()
        print("Starting Flask-SocketIO server on http://127.0.0.1:5000...")
        socketio.run(app, host="127.0.0.1", port=5000, debug=True)
    except Exception as e:
        print(f"FATAL ERROR: {e}")
        traceback.print_exc()
