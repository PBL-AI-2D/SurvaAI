# RUN 'pytest test/selenium/test_01-dapat-membuat-survei.py'

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
    logger.info(f"\nStarting the test \n{'='*3}\n01-dapat-membuat-survei.py\n{'='*3}")
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
    logger.info("Navigating to login page...")
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

def test_create_new_survey(login):
    driver = login
    
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//a[@href="/manage-survey"]')))
        logger.info("Login successful. Redirecting to manage survey page.")

        link_kelola_survei = driver.find_element(By.XPATH, '//a[@href="/manage-survey"]')
        link_kelola_survei.click()

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//h1[text()="Manage Survey"]')))
        logger.info("Successfully reached the 'Manage Survey' page.")

        card_survei_baru = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//*[text()='New Survey']"))
        )
        logger.info("Clicking 'New Survey' button.")
        card_survei_baru.click()

        WebDriverWait(driver, 10).until(EC.url_contains('edit'))
        assert "Edit Survey" in driver.page_source
        logger.info("Successfully navigated to the 'Edit Survey' page.")

        time.sleep(5)

    except Exception as e:
        logger.error(f"Test failed due to error: {e}")
        pytest.fail(f"Terjadi kesalahan: {e}")
