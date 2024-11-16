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

    expenses_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Gastos")))
    expenses_link.click()

    wait.until(EC.url_contains("/dashboard/expenses"))
    print("Navegado a la página de Gastos.")

    wait.until(EC.presence_of_element_located((By.XPATH, "//table")))

    first_edit_button = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "(//button[contains(@aria-label, 'Editar gasto')])[1]")
    ))
    first_edit_button.click()

    wait.until(EC.url_contains("/dashboard/expenses/edit"))
    print("Navegado a la página de Editar Gasto.")

    amount_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@aria-label='Monto del Gasto']")))
    amount_field.clear()
    amount_field.send_keys("2000.00")

    date_field = driver.find_element(By.XPATH, "//input[@aria-label='Fecha del Gasto']")
    date_field.clear()
    date_field.send_keys("2023-11-01")

    description_field = driver.find_element(By.XPATH, "//textarea[@aria-label='Descripción del Gasto']")
    description_field.clear()
    description_field.send_keys("Actualización de la compra de insumos")

    category_name = "Negocio"
    category_input = driver.find_element(By.XPATH, "//input[@aria-label='Categoría del Gasto']")
    category_input.click()
    category_input.send_keys(category_name)
    category_input.send_keys(Keys.DOWN)
    category_input.send_keys(Keys.ENTER)

    supplier_name = "YPF"
    supplier_input = driver.find_element(By.XPATH, "//input[@aria-label='Proveedor del Gasto']")
    supplier_input.click()
    supplier_input.send_keys(supplier_name)
    supplier_input.send_keys(Keys.DOWN)
    supplier_input.send_keys(Keys.ENTER)

    update_button = driver.find_element(By.XPATH, "//button[contains(., 'Actualizar Gasto')]")
    update_button.click()

    wait.until(EC.url_contains("/dashboard/expenses"))
    print("Gasto actualizado exitosamente.")

except Exception as e:
    print("Ocurrió un error:", e)

finally:
    driver.quit()
