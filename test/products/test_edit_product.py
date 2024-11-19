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

    products_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Productos")))
    products_link.click()

    wait.until(EC.url_contains("/dashboard/products"))
    print("Navegado a la página de Productos.")

    edit_button_xpath = "(//button[contains(@aria-label, 'Editar producto')])[1]"
    edit_button = wait.until(EC.element_to_be_clickable((By.XPATH, edit_button_xpath)))
    edit_button.click()

    wait.until(EC.url_contains("/dashboard/products/edit"))
    print("Navegado a la página de Editar Producto.")

    barcode_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@aria-label='Código de Barras']")))
    barcode_field.click()
    barcode_field.send_keys(Keys.COMMAND + "a")
    barcode_field.send_keys(Keys.DELETE)
    barcode_field.send_keys("9876543210987")

    name_field = driver.find_element(By.XPATH, "//input[@aria-label='Nombre del Producto']")
    name_field.click()
    name_field.send_keys(Keys.COMMAND + "a")
    name_field.send_keys(Keys.DELETE)
    name_field.send_keys("Pan Integral Premium")

    retail_price_field = driver.find_element(By.XPATH, "//input[@aria-label='Precio Minorista']")
    retail_price_field.click()
    retail_price_field.send_keys(Keys.COMMAND + "a")
    retail_price_field.send_keys(Keys.DELETE)
    retail_price_field.send_keys("120.00")

    wholesale_price_field = driver.find_element(By.XPATH, "//input[@aria-label='Precio Mayorista']")
    wholesale_price_field.click()
    wholesale_price_field.send_keys(Keys.COMMAND + "a")
    wholesale_price_field.send_keys(Keys.DELETE)
    wholesale_price_field.send_keys("100.00")

    description_field = driver.find_element(By.XPATH, "//textarea[@aria-label='Descripción del Producto']")
    description_field.click()
    description_field.send_keys(Keys.COMMAND + "a")
    description_field.send_keys(Keys.DELETE)
    description_field.send_keys("Pan integral premium con ingredientes seleccionados.")

    category_input = driver.find_element(By.XPATH, "//input[@aria-label='Categoría del Producto']")
    category_input.click()
    category_input.send_keys(Keys.COMMAND + "a")
    category_input.send_keys(Keys.DELETE)
    category_input.send_keys("test")
    time.sleep(1)
    category_input.send_keys(Keys.DOWN)
    category_input.send_keys(Keys.ENTER)

    brand_input = driver.find_element(By.XPATH, "//input[@aria-label='Marca del Producto']")
    brand_input.click()
    brand_input.send_keys(Keys.COMMAND + "a")
    brand_input.send_keys(Keys.DELETE)
    brand_input.send_keys("test marca")
    time.sleep(1)
    brand_input.send_keys(Keys.DOWN)
    brand_input.send_keys(Keys.ENTER)

    update_button = driver.find_element(By.XPATH, "//button[contains(., 'Actualizar Producto')]")
    update_button.click()

    wait.until(EC.url_contains("/dashboard/products"))
    print("Producto actualizado exitosamente.")

except Exception as e:
    print("Ocurrió un error:", e)

finally:
    driver.quit()
