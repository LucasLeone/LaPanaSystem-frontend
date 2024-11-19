from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = Options()
options.add_argument('--start-maximized')

driver = webdriver.Chrome(options=options)

try:
    driver.get("http://localhost:3000/auth/login")
    wait = WebDriverWait(driver, 10)

    # Inicio de sesión
    username_field = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, "//input[@placeholder='Nombre de usuario']")
        )
    )
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

    # Esperar a que la tabla esté presente
    wait.until(EC.presence_of_element_located((By.XPATH, "//table")))

    # Eliminar el primer cliente
    first_delete_button = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "(//button[contains(@aria-label, 'Eliminar cliente')])[1]")
        )
    )
    first_delete_button.click()
    print("Hiciste clic en el botón de eliminar del primer cliente.")

    # Confirmar eliminación
    confirm_delete_button = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(), 'Eliminar')]")
        )
    )
    confirm_delete_button.click()
    print("Confirmaste la eliminación en el modal.")

    # Esperar a que el botón se vuelva obsoleto
    wait.until(EC.staleness_of(first_delete_button))
    print("Cliente eliminado exitosamente.")

    time.sleep(5)


except Exception as e:
    print("Ocurrió un error:", e)

finally:
    driver.quit()
