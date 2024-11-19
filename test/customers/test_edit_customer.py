from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import platform

options = Options()
options.add_argument('--start-maximized')

driver = webdriver.Chrome(options=options)

try:
    driver.get("http://localhost:3000/auth/login")
    wait = WebDriverWait(driver, 10)

    # Inicio de sesión
    username_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Nombre de usuario']")))
    username_field.send_keys("lucasleone03")

    password_field = driver.find_element(By.XPATH, "//input[@placeholder='********']")
    password_field.send_keys("admin12345")

    login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    login_button.click()

    wait.until(EC.url_contains("/dashboard"))
    print("¡Inicio de sesión exitoso!")

    # Navegar a Clientes
    clientes_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Clientes")))
    clientes_link.click()

    wait.until(EC.url_contains("/dashboard/customers"))
    print("Navegado a la página de Clientes.")

    # Editar el primer cliente
    edit_button_xpath = "(//button[contains(@aria-label, 'Editar cliente')])[1]"
    edit_button = wait.until(EC.element_to_be_clickable((By.XPATH, edit_button_xpath)))
    edit_button.click()

    wait.until(EC.url_contains("/dashboard/customers/edit"))
    print("Navegado a la página de Editar Cliente.")

    # Determinar la tecla de comando según el sistema operativo
    if platform.system() == 'Darwin':
        modifier_key = Keys.COMMAND
    else:
        modifier_key = Keys.CONTROL

    # Editar los campos
    nombre_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Ingrese el nombre del cliente']")))
    nombre_field.click()
    nombre_field.send_keys(modifier_key + "a")
    nombre_field.send_keys(Keys.DELETE)
    nombre_field.send_keys("Carlos Gómez")

    email_field = driver.find_element(By.XPATH, "//input[@placeholder='Ingrese el correo electrónico']")
    email_field.click()
    email_field.send_keys(modifier_key + "a")
    email_field.send_keys(Keys.DELETE)
    email_field.send_keys("carlos.gomez@example.com")

    celular_field = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Ingrese el número de celular')]")
    celular_field.click()
    celular_field.send_keys(modifier_key + "a")
    celular_field.send_keys(Keys.DELETE)
    celular_field.send_keys("+5491122334455")

    direccion_field = driver.find_element(By.XPATH, "//input[@placeholder='Ingrese la dirección del cliente']")
    direccion_field.click()
    direccion_field.send_keys(modifier_key + "a")
    direccion_field.send_keys(Keys.DELETE)
    direccion_field.send_keys("Avenida Siempre Viva 755")

    # Actualizar Cliente
    actualizar_cliente_button = driver.find_element(By.XPATH, "//button[contains(., 'Actualizar Cliente')]")
    actualizar_cliente_button.click()

    wait.until(EC.url_contains("/dashboard/customers"))
    print("Cliente actualizado exitosamente.")

except Exception as e:
    print("Ocurrió un error:", e)

finally:
    driver.quit()
