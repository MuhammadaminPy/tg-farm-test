import telegram
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes
import sqlite3
import logging
# 💡 ИСПРАВЛЕНИЕ: Обеспечение импорта datetime
import datetime 

TOKEN = '7691409512:AAEvk_vx5n2PLc17Gu39rBRWssq3h6kEC0'
DB_NAME = 'bot_db.db'
WEB_APP_URL = 'https://muhammadaminpy.github.io/tg-farm-test/index.html'

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Добавлено поле first_name и reg_date для хранения имени и даты регистрации
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT,
            first_name TEXT, 
            reg_date TEXT, 
            is_admin INTEGER DEFAULT 0,
            balance REAL DEFAULT 0.00
        )
    """)
    conn.commit()
    conn.close()

def get_user(user_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

def add_or_update_user(user_id, username, first_name):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Проверяем, существует ли пользователь
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    if cursor.fetchone() is None:
        # Если не существует, добавляем с текущей датой
        reg_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            "INSERT INTO users (user_id, username, first_name, reg_date) VALUES (?, ?, ?, ?)", 
            (user_id, username, first_name, reg_date)
        )
    else:
        # Если существует, обновляем имя/юзернейм
        cursor.execute(
            "UPDATE users SET username = ?, first_name = ? WHERE user_id = ?", 
            (username, first_name, user_id)
        )
        
    conn.commit()
    conn.close()

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    username = user.username or user.first_name
    
    # Автоматическая регистрация/обновление пользователя
    add_or_update_user(user.id, username, user.first_name)
    
    keyboard = [
        # Кнопка ведет на главную страницу, а JS на фронте обработает вход
        [InlineKeyboardButton("🌾 Открыть Ферму (Mini App)", web_app=WebAppInfo(url=WEB_APP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_html(
        f"<b>Добро пожаловать, {user.first_name}!</b> 🥳\n\n"
        f"Ваш Telegram ID: <code>{user.id}</code>\n"
        "Вы автоматически зарегистрированы. Нажмите на кнопку ниже, чтобы открыть "
        "Ферму Инвестиций.",
        reply_markup=reply_markup
    )

async def profile_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    db_user = get_user(user.id)
    
    if db_user:
        # Индекс 5 - balance, Индекс 3 - reg_date
        balance = db_user[5]
        reg_date = db_user[3].split()[0] 
    else:
        balance = 0.00
        reg_date = "N/A"
        
    # Пароль для фронтенда: имя пользователя
    password_display = user.first_name 
    
    await update.message.reply_html(
        f"<b>Профиль пользователя:</b>\n"
        f"👤 Имя: {user.first_name}\n"
        f"🆔 Telegram ID: <code>{user.id}</code>\n"
        f"🔑 Пароль (для входа в TWA): <b>{password_display}</b>\n"
        f"🗓 Дата регистрации: {reg_date}\n"
        f"💰 Баланс: {balance:.2f} (Имитация)\n\n"
        "Для управления балансом используйте Mini App."
    )

def main():
    init_db()
    
    application = Application.builder().token(TOKEN).build()

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("profile", profile_command))
    
    logger.info("Бот запущен...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()