# RUN 'pytest test/selenium/test_03-dapat-mengelola-kalkulasi-harga-survei.py'

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
    logger.info(f"\nStarting the test \n{'='*3}\n03-dapat-mengelola-kalkulasi-harga-survei.py\n{'='*3}")
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

def test_configuring_survey_price(login):
    driver = login

    try:
        survey_price_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//a[@href='/admin/configuration/survey-price']"))
        )
        survey_price_link.click()
        logger.info("Navigating to Survey Price page.")
        
        WebDriverWait(driver, 10).until(EC.url_contains('survey-price'))
        logger.info("Successfully reached the 'Survey Price' page.")

        edit_survey_price = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Edit')]"))
        )
        logger.info("Klik tombol 'Edit'.")
        edit_survey_price.click()

        logger.info("Updating survey prices...")
        base_price_input = driver.find_element(By.ID, 'harga_dasar')
        price_per_question_input = driver.find_element(By.ID, 'harga_per_pertanyaan')
        price_per_respondent_input = driver.find_element(By.ID, 'harga_per_responden')
        price_per_duration_input = driver.find_element(By.ID, 'harga_per_durasi')

        base_price_input.clear()
        price_per_question_input.clear()
        price_per_respondent_input.clear()
        price_per_duration_input.clear()

        def format_price(price):
            return f"Rp. {int(price):,}"

        base_price = 50000
        price_per_question = 10000
        price_per_respondent = 5000
        price_per_duration = 2500

        base_price_input.send_keys(str(base_price))
        price_per_question_input.send_keys(str(price_per_question))
        price_per_respondent_input.send_keys(str(price_per_respondent))
        price_per_duration_input.send_keys(str(price_per_duration))

        logger.info("Prices updated.")

        save_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Save Changes')]"))
        )
        save_button.click()

        logger.info("Clicked 'Save Changes' button.")

        success_message = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'updated')]"))
        )

        assert success_message.is_displayed(), "Success message not displayed!"
        logger.info("Survey price changes saved successfully.")

        logger.info("Verifying updated prices...")

        base_price_displayed = driver.find_element(By.XPATH, "//label[text()='Base Price']/following-sibling::div").text
        price_per_question_displayed = driver.find_element(By.XPATH, "//label[text()='Price per Question']/following-sibling::div").text
        price_per_respondent_displayed = driver.find_element(By.XPATH, "//label[text()='Price per Respondent']/following-sibling::div").text
        price_per_duration_displayed = driver.find_element(By.XPATH, "//label[text()='Price per Duration (days)']/following-sibling::div").text

        assert base_price_displayed == format_price(base_price), f"Base Price not updated correctly, found: {base_price_displayed}"
        assert price_per_question_displayed == format_price(price_per_question), f"Price per Question not updated correctly, found: {price_per_question_displayed}"
        assert price_per_respondent_displayed == format_price(price_per_respondent), f"Price per Respondent not updated correctly, found: {price_per_respondent_displayed}"
        assert price_per_duration_displayed == format_price(price_per_duration), f"Price per Duration not updated correctly, found: {price_per_duration_displayed}"

        logger.info("All prices updated correctly.")


        time.sleep(5)

    except Exception as e:
        logger.error(f"Test failed due to error: {e}")
        pytest.fail(f"Terjadi kesalahan: {e}")
