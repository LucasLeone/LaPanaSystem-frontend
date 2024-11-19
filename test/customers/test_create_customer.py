from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time

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
    print("¡Inicio de sesión exitoso!")

    clientes_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Clientes")))
    clientes_link.click()

    wait.until(EC.url_contains("/dashboard/customers"))
    print("Navegado a la página de Clientes.")

    nuevo_cliente_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Nuevo Cliente')]")))
    nuevo_cliente_button.click()

    wait.until(EC.url_contains("/dashboard/customers/create"))
    print("Navegado a la página de Crear Cliente.")

    nombre_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Ingrese el nombre del cliente']")))
    nombre_field.send_keys("Juan Paerez")

    email_field = driver.find_element(By.XPATH, "//input[@placeholder='Ingrese el correo electrónico']")
    email_field.send_keys("juan.aperez@example.com")

    celular_field = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Ingrese el número de celular')]")
    celular_field.send_keys("+54911122345678")

    direccion_field = driver.find_element(By.XPATH, "//input[@placeholder='Ingrese la dirección del cliente']")
    direccion_field.send_keys("Calle Falsa 123")

    crear_cliente_button = driver.find_element(By.XPATH, "//button[contains(., 'Crear Cliente')]")
    crear_cliente_button.click()

    wait.until(EC.url_contains("/dashboard/customers"))
    print("Cliente creado exitosamente.")

except Exception as e:
    print("Ocurrió un error:", e)

finally:
    driver.quit()
