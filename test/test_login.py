from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
import urllib.parse

options = Options()
options.add_argument('--start-maximized')

driver = webdriver.Chrome(options=options)

try:
    driver.get("http://localhost:3000/auth/login")

    wait = WebDriverWait(driver, 10)
    username_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Nombre de usuario']")))

    username_field.send_keys("lucasleone03")

    password_field = driver.find_element(By.XPATH, "//input[@placeholder='********']")

    password_field.send_keys("admin12345")

    login_button = driver.find_element(By.XPATH, "//button[@type='submit']")

    login_button.click()

    wait.until(EC.url_contains("/dashboard"))

    current_url = driver.current_url
    print("URL actual después del inicio de sesión:", current_url)

    if "/dashboard" in current_url:
        print("¡Inicio de sesión exitoso!")
    else:
        print("Error en el inicio de sesión.")

    cookies = driver.get_cookies()
    print("\nCookies actuales en el navegador:")
    for cookie in cookies:
        print(f"- {cookie['name']}: {cookie['value']}")

    user_cookie = driver.get_cookie("user")
    if user_cookie:
        user_value_encoded = user_cookie['value']
        user_value_decoded = urllib.parse.unquote(user_value_encoded)
        user_data = json.loads(user_value_decoded)
        print("\nCookie 'user' encontrada:")
        print(f"Usuario: {user_data}")
    else:
        print("\nCookie 'user' no encontrada.")

    token_cookie = driver.get_cookie("access_token")
    if token_cookie:
        access_token = token_cookie['value']
        print("\nCookie 'access_token' encontrada:")
        print(f"Access Token: {access_token}")
    else:
        print("\nCookie 'access_token' no encontrada.")

except Exception as e:
    print("Ocurrió un error:", e)

finally:
    driver.quit()
