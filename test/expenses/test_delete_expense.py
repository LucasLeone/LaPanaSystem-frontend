from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time

# Configuración de opciones de Chrome
options = Options()
options.add_argument("--start-maximized")

# Inicializar el controlador de Chrome
driver = webdriver.Chrome(options=options)

try:
    # ================================
    # Inicio de sesión
    # ================================
    driver.get("http://localhost:3000/auth/login")

    wait = WebDriverWait(driver, 10)
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

    # ================================
    # Navegar a la página de Gastos
    # ================================
    expenses_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Gastos")))
    expenses_link.click()

    wait.until(EC.url_contains("/dashboard/expenses"))
    print("Navegado a la página de Gastos.")

    # ================================
    # Seleccionar la primera expensa y hacer clic en Eliminar
    # ================================
    # Esperar a que la tabla de gastos esté presente
    wait.until(EC.presence_of_element_located((By.XPATH, "//table")))

    # Encontrar el primer botón de eliminar en la tabla
    first_delete_button = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "(//button[contains(@aria-label, 'Eliminar gasto')])[1]")
        )
    )
    first_delete_button.click()

    # Esperar a que aparezca el modal de confirmación
    confirm_modal = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "(//button[contains(@aria-label, 'Confirmar eliminar gasto')])")
        )
    )

    # Hacer clic en el botón "Eliminar" dentro del modal
    confirm_delete_button = confirm_modal.find_element(
        By.XPATH, "//button[contains(., 'Eliminar')]"
    )
    confirm_delete_button.click()

    # Esperar a que el gasto sea eliminado y la tabla se actualice
    time.sleep(2)  # Puedes ajustar el tiempo de espera según sea necesario

    print("Gasto eliminado exitosamente.")

except Exception as e:
    print("Ocurrió un error:", e)

finally:
    driver.quit()
