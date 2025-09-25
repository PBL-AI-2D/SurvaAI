# RUN 'pytest test/selenium/test_02-dapat-melakukan-pembayaran-pengajuan-survei.py'

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

file_handler = logging.FileHandler('./test/selenium/testing_selenium.log')
file_handler.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)

@pytest.fixture(scope="module")
def driver():
    logger.info(f"\nStarting the test \n{'='*3}\n02-dapat-melakukan-pembayaran-pengajuan-survei.py\n{'='*3}")
    options = webdriver.ChromeOptions()
    options.add_argument('--incognito')  # Enable incognito mode

    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    yield driver
    driver.quit()
    logger.info("Test completed. Browser closed.")

@pytest.fixture
def login(driver):
    """Helper fixture to login and return the driver."""
    login_url = 'https://student-project.id/login'
    driver.get(login_url)

    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, 'email')))
    email_field = driver.find_element(By.NAME, 'email')
    password_field = driver.find_element(By.NAME, 'password')
    login_button = driver.find_element(By.XPATH, '//button[@type="submit"]')

    email_field.send_keys('') # <-- Modify the value with real email
    password_field.send_keys('') # <-- Modify the value with real password
    login_button.click()

    logger.info("Login successful.")
    return driver

def test_survey_payment(login):
    driver = login
    
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//a[@href="/manage-survey"]')))
        logger.info("Login successful. Redirecting to manage survey page.")

        link_kelola_survei = driver.find_element(By.XPATH, '//a[@href="/manage-survey"]')
        link_kelola_survei.click()

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//h1[text()="Manage Survey"]')))
        logger.info("Successfully reached the 'Manage Survey' page.")

        payment_pending_badge = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Payment Pending')]"))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", payment_pending_badge)
        time.sleep(1)  # Tunggu sebentar agar scroll berhasil
        driver.execute_script("window.scrollBy(0, -100);")  # Geser sedikit ke atas

        time.sleep(3)

        payment_pending_badge.click()
        logger.info("Clicked on 'Payment Pending' survey card.")

        pay_and_publish_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Pay & Publish Survey')]"))
        )
        pay_and_publish_button.click()
        logger.info("Clicked 'Pay & Publish Survey' button.")

        #
        # Move to new TAB
        #
        time.sleep(5)
        window_handles = driver.window_handles
        driver.switch_to.window(window_handles[-1])

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//h2[text()='Order Summary']")))
        logger.info("Order Summary page found.")

        qr_payment_toggle_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@id='radix-:rm:'][@aria-expanded='false']"))
        )
        qr_payment_toggle_button.click()
        logger.info("Accordion for QR Payments opened.")

        expanded = driver.find_element(By.XPATH, "//button[@id='radix-:rm:']").get_attribute("aria-expanded")
        if expanded == "false":
            logger.warning("QR Payments accordion is still closed, trying to open again.")
            qr_payment_toggle_button.click()

        qr_code_container = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "qr-code-canvas-container"))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", qr_code_container)

        time.sleep(3)

        simulate_payment_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@data-testid='simulate-button']"))
        )
        simulate_payment_button.click()
        logger.info("QRIS payment simulation button clicked.")

        thank_you_message = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, "//h1[text()='Thank You!']"))
        )

        assert thank_you_message.is_displayed(), "Thank You message is not displayed!"
        logger.info("Payment successful, success page appeared.")

        time.sleep(5)

        #
        # Back to previous TAB
        #
        driver.close()

        window_handles = driver.window_handles
        driver.switch_to.window(window_handles[-1])

        manage_survey_link = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//a[@href="/manage-survey"]'))
        )
        manage_survey_link.click()
        logger.info("Clicked on 'Manage Survey' link and redirected to the manage survey page.")

        published_badge = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Published')]"))
        )
        assert published_badge.is_displayed(), "Published badge is not displayed!"
        logger.info("Survey successfully published.")

        time.sleep(5)

    except Exception as e:
        logger.error(f"Test failed due to error: {e}")
        pytest.fail(f"Error occurred: {e}")
