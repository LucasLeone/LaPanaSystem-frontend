from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
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

    products_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Productos")))
    products_link.click()

    wait.until(EC.url_contains("/dashboard/products"))

    print("Navegado a la página de Productos.")

    new_product_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Nuevo Producto')]")))
    new_product_button.click()

    wait.until(EC.url_contains("/dashboard/products/create"))

    print("Navegado a la página de Crear Producto.")

    barcode_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@aria-label='Código de Barras']")))
    barcode_field.send_keys("123456789013")

    name_field = driver.find_element(By.XPATH, "//input[@aria-label='Nombre del Producto']")
    name_field.send_keys("Pan Negro")

    retail_price_field = driver.find_element(By.XPATH, "//input[@aria-label='Precio Minorista']")
    retail_price_field.send_keys("100.00")

    wholesale_price_field = driver.find_element(By.XPATH, "//input[@aria-label='Precio Mayorista']")
    wholesale_price_field.send_keys("90.00")

    description_field = driver.find_element(By.XPATH, "//textarea[@aria-label='Descripción del Producto']")
    description_field.send_keys("Pan integral saludable")

    category_input = driver.find_element(By.XPATH, "//input[@aria-label='Categoría del Producto']")
    category_input.click()
    category_input.send_keys("Panadería")
    time.sleep(1)
    category_input.send_keys(Keys.DOWN)
    category_input.send_keys(Keys.ENTER)

    brand_input = driver.find_element(By.XPATH, "//input[@aria-label='Marca del Producto']")
    brand_input.click()
    brand_input.send_keys("Leone")
    time.sleep(1)
    brand_input.send_keys(Keys.DOWN)
    brand_input.send_keys(Keys.ENTER)

    create_button = driver.find_element(By.XPATH, "//button[contains(., 'Crear Producto')]")
    create_button.click()
    
    wait.until(EC.url_contains("/dashboard/products"))

    print("Producto creado exitosamente.")

except Exception as e:
    print("Ocurrió un error:", e)

finally:
    driver.quit()
