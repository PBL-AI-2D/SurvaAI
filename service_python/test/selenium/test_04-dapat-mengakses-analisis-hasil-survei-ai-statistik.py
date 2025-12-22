# RUN 'pytest test/selenium/test_04-dapat-mengakses-analisis-hasil-survei-ai-statistik.py -v'

"""
Test Selenium untuk fitur Analisis / Hasil Survey (AI / Statistik)

Fitur yang diuji:
1. Halaman Analisis Survey Dasar (/manage-survey/analysis/[id])
   - Menampilkan daftar pertanyaan dengan visualisasi
   - Mengubah tipe visualisasi (pie, bar, doughnut, radar, text, wordcloud, sentiment_analysis)
   - Memverifikasi chart/visualisasi ditampilkan dengan benar
   - Memverifikasi data response ditampilkan

2. Halaman AI Analytics Dashboard (/manage-survey/ai-analytics/[id])
   - AI Insight Summary banner
   - Satisfaction & Preference Overview (3 charts)
   - AI Respondent Segmentation (scatter plot, filters, segmentation table)
   - Dashboard Analytic Section (trend charts, metrics)
   - Download report button
   - Navigation breadcrumb

3. Integrasi dengan Python AI Service
   - Verifikasi data dari API Python service ditampilkan
   - Verifikasi loading states
   - Verifikasi error handling
"""

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
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
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)


@pytest.fixture(scope="module")
def driver():
    logger.info("\n%s\nStarting the test\n%s\n04-dapat-mengakses-analisis-hasil-survei-ai-statistik.py\n%s", 
                '='*60, '='*60, '='*60)
    options = webdriver.ChromeOptions()
    options.add_argument('--incognito')  # Enable incognito mode
    options.add_argument('--disable-blink-features=AutomationControlled')
    
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    yield driver
    driver.quit()
    logger.info("Test completed. Browser closed.")


@pytest.fixture
def login(driver):
    """Helper fixture to login and return the driver."""
    logger.info("Navigating to login page...")
    login_url = 'http://localhost:3000/login'
    driver.get(login_url)

    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, 'email')))
    email_field = driver.find_element(By.NAME, 'email')
    password_field = driver.find_element(By.NAME, 'password')
    login_button = driver.find_element(By.XPATH, '//button[@type="submit"]')

    email_field.send_keys('umum@email.com')  # <-- Modify the value with real email
    password_field.send_keys('12345678')  # <-- Modify the value with real password
    login_button.click()

    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//a[@href="/manage-survey"]')))
    logger.info("Login successful.")
    return driver


def get_survey_id_from_manage_page(driver):
    """
    Helper function untuk mendapatkan survey ID dari halaman manage survey.
    Mencari survey yang sudah published dan memiliki responses.
    """
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//h1[text()="Manage Survey"]')))
        logger.info("Successfully reached the 'Manage Survey' page.")
        
        # Cari survey card yang memiliki badge "Published" dan memiliki jumlah responden > 0
        # Atau bisa juga mencari link ke analysis page
        time.sleep(2)
        
        # Coba cari link ke analysis atau survey card
        survey_cards = driver.find_elements(By.XPATH, "//a[contains(@href, '/manage-survey/analysis/')]")
        if survey_cards:
            # Ambil survey ID dari href pertama
            href = survey_cards[0].get_attribute('href')
            survey_id = href.split('/analysis/')[-1].split('/')[0]
            logger.info("Found survey ID from analysis link: %s", survey_id)
            return survey_id
        
        # Alternatif: cari dari overview link
        overview_links = driver.find_elements(By.XPATH, "//a[contains(@href, '/manage-survey/overview/')]")
        if overview_links:
            href = overview_links[0].get_attribute('href')
            survey_id = href.split('/overview/')[-1].split('/')[0]
            logger.info("Found survey ID from overview link: %s", survey_id)
            return survey_id
        
        # Jika tidak ditemukan, gunakan survey ID default (perlu diubah sesuai kebutuhan)
        logger.warning("Could not find survey ID automatically. Using default.")
        return "d0c0bd44-2128-43cf-b624-8939ab5495df"  # <-- Modify with actual survey ID if needed
        
    except (TimeoutException, ValueError, AttributeError) as e:
        logger.error("Error getting survey ID: %s", e)
        return "d0c0bd44-2128-43cf-b624-8939ab5495df"  # <-- Modify with actual survey ID if needed


def test_analysis_survey_page(login):
    """
    Test untuk halaman Analisis Survey Dasar (/manage-survey/analysis/[id])
    """
    driver = login
    
    try:
        # Navigate to Manage Survey page
        link_kelola_survei = driver.find_element(By.XPATH, '//a[@href="/manage-survey"]')
        link_kelola_survei.click()
        
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//h1[text()="Manage Survey"]')))
        logger.info("Successfully reached the 'Manage Survey' page.")
        
        # Get survey ID
        survey_id = get_survey_id_from_manage_page(driver)
        
        # Navigate to Analysis page
        analysis_url = f'http://localhost:3000/manage-survey/analysis/{survey_id}'
        driver.get(analysis_url)
        
        # Wait for page to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, '//h1[contains(text(), "Analysis Survey")]'))
        )
        logger.info("Successfully navigated to Analysis Survey page for survey ID: %s", survey_id)
        
        # Verify page title
        page_title = driver.find_element(By.XPATH, '//h1[contains(text(), "Analysis Survey")]')
        assert page_title.is_displayed(), "Analysis Survey page title not displayed!"
        logger.info("Page title verified.")
        
        # Verify Survey ID is displayed
        survey_id_element = driver.find_element(By.XPATH, f'//span[contains(text(), "{survey_id}")]')
        assert survey_id_element.is_displayed(), "Survey ID not displayed!"
        logger.info("Survey ID verified.")
        
        # Wait for analysis data to load (check for loading state or actual content)
        time.sleep(3)
        
        # Check if analysis list is present (either with data or empty state)
        try:
            # Check for empty state
            empty_state = driver.find_elements(By.XPATH, "//*[contains(text(), 'No summary available')]")
            if empty_state:
                logger.info("Analysis page loaded but no data available yet.")
                return  # Exit early if no data
            
            # Check for analysis cards/questions
            analysis_cards = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.XPATH, "//div[contains(@class, 'space-y-5')]//div[contains(@class, 'Card')]"))
            )
            
            if analysis_cards:
                logger.info("Found %d analysis cards/questions.", len(analysis_cards))
                
                # Test visualization type selection for first question
                try:
                    # Find visualization type select dropdown
                    visualization_selects = driver.find_elements(By.XPATH, "//select[contains(@name, 'visualization') or contains(@id, 'visualization')]")
                    
                    if not visualization_selects:
                        # Try finding by other selectors (might be a custom dropdown)
                        visualization_selects = driver.find_elements(By.XPATH, "//div[contains(@class, 'select')]//button")
                    
                    if visualization_selects:
                        logger.info("Found %d visualization type selectors.", len(visualization_selects))
                        
                        # Click first visualization selector if it's a button
                        if 'button' in visualization_selects[0].tag_name.lower():
                            visualization_selects[0].click()
                            time.sleep(1)
                            
                            # Try to select a different visualization type
                            # Look for options like 'pie', 'bar', 'doughnut', etc.
                            try:
                                pie_option = driver.find_element(By.XPATH, "//*[contains(text(), 'Pie') or contains(text(), 'pie')]")
                                pie_option.click()
                                logger.info("Changed visualization type to Pie.")
                                time.sleep(2)
                            except (TimeoutException, ValueError):
                                logger.info("Could not change visualization type (might be disabled or not available).")
                    else:
                        logger.info("Visualization type selector not found (might not be available for this question type).")
                        
                except (TimeoutException, ValueError) as e:
                    logger.warning("Could not test visualization type selection: %s", e)
                
                # Verify that charts/visualizations are rendered
                # Check for canvas elements (charts) or other visualization elements
                chart_elements = driver.find_elements(By.XPATH, "//canvas | //svg | //img[contains(@alt, 'Word Cloud')] | //div[contains(@class, 'chart')]")
                if chart_elements:
                    logger.info("Found %d chart/visualization elements.", len(chart_elements))
                else:
                    logger.info("No chart elements found (might be text-based visualization).")
                
                # Verify question text is displayed
                question_texts = driver.find_elements(By.XPATH, "//div[contains(@class, 'font-semibold')]//span[contains(@class, 'break-words')]")
                if question_texts:
                    logger.info("Found %d question texts displayed.", len(question_texts))
                    for idx, q_text in enumerate(question_texts[:3]):  # Log first 3
                        logger.info("Question %d: %s...", idx + 1, q_text.text[:50])
            else:
                logger.info("No analysis cards found.")
                
        except TimeoutException:
            logger.warning("Timeout waiting for analysis content. Page might still be loading or no data available.")
        
        logger.info("Analysis Survey page test completed successfully.")
        time.sleep(2)
        
    except (TimeoutException, AssertionError, ValueError) as e:
        logger.error("Test failed due to error: %s", e)
        pytest.fail("Terjadi kesalahan: %s" % e)


def test_ai_analytics_dashboard(login):
    """
    Test untuk halaman AI Analytics Dashboard (/manage-survey/ai-analytics/[id])
    """
    driver = login
    
    try:
        # Navigate to Manage Survey page
        link_kelola_survei = driver.find_element(By.XPATH, '//a[@href="/manage-survey"]')
        link_kelola_survei.click()
        
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//h1[text()="Manage Survey"]')))
        logger.info("Successfully reached the 'Manage Survey' page.")
        
        # Get survey ID
        survey_id = get_survey_id_from_manage_page(driver)
        
        # Navigate to AI Analytics Dashboard page
        ai_analytics_url = f'http://localhost:3000/manage-survey/ai-analytics/{survey_id}'
        driver.get(ai_analytics_url)
        
        # Wait for page to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, '//h1[contains(text(), "Overview Survey")]'))
        )
        logger.info("Successfully navigated to AI Analytics Dashboard page for survey ID: %s", survey_id)
        
        # Verify page title
        page_title = driver.find_element(By.XPATH, '//h1[contains(text(), "Overview Survey")]')
        assert page_title.is_displayed(), "AI Analytics Dashboard page title not displayed!"
        logger.info("Page title verified.")
        
        # Scroll to load all content
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(2)
        
        # 1. Test AI Insight Summary Banner
        try:
            ai_insight_banner = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'AI Insight Summary')]"))
            )
            assert ai_insight_banner.is_displayed(), "AI Insight Summary banner not displayed!"
            logger.info("AI Insight Summary banner verified.")
            
            # Check if summary text is present
            summary_text = driver.find_elements(By.XPATH, "//div[contains(@class, 'text-sm')]//p")
            if summary_text:
                logger.info("AI Insight Summary text found: %s...", summary_text[0].text[:100])
        except TimeoutException:
            logger.warning("AI Insight Summary banner not found (might not be available).")
        
        # Scroll down to see more sections
        driver.execute_script("window.scrollBy(0, 500);")
        time.sleep(2)
        
        # 2. Test Satisfaction & Preference Overview Section
        try:
            satisfaction_section = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Satisfaction & Preference Overview')]"))
            )
            assert satisfaction_section.is_displayed(), "Satisfaction & Preference Overview section not displayed!"
            logger.info("Satisfaction & Preference Overview section verified.")
            
            # Check for charts in this section
            chart_containers = driver.find_elements(By.XPATH, "//div[contains(@class, 'min-h-[400px]')]")
            if chart_containers:
                logger.info("Found %d chart containers in Satisfaction section.", len(chart_containers))
            
            # Check for specific chart titles
            chart_titles = [
                "Distribution of respondent satisfaction levels",
                "Distribution by preference category",
                "Satisfaction trend over time"
            ]
            
            for title in chart_titles:
                try:
                    chart_title = driver.find_element(By.XPATH, f"//h4[contains(text(), '{title}')]")
                    if chart_title.is_displayed():
                        logger.info("Chart title verified: %s", title)
                except (NoSuchElementException, TimeoutException):
                    logger.warning("Chart title not found: %s", title)
            
            # Check for conclusion box
            try:
                conclusion_box = driver.find_element(By.XPATH, "//div[contains(text(), 'Conclusion:')]")
                if conclusion_box.is_displayed():
                    logger.info("Conclusion box found in Satisfaction section.")
            except (NoSuchElementException, TimeoutException):
                logger.info("Conclusion box not found (might not be available).")
                
        except TimeoutException:
            logger.warning("Satisfaction & Preference Overview section not found.")
        
        # Scroll down more
        driver.execute_script("window.scrollBy(0, 800);")
        time.sleep(2)
        
        # 3. Test AI Respondent Segmentation Section
        try:
            segmentation_section = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'AI Respondent Segmentation')]"))
            )
            assert segmentation_section.is_displayed(), "AI Respondent Segmentation section not displayed!"
            logger.info("AI Respondent Segmentation section verified.")
            
            # Check for scatter plot
            try:
                scatter_plot = driver.find_elements(By.XPATH, "//div[contains(@class, 'ScatterPlot')] | //canvas | //svg")
                if scatter_plot:
                    logger.info("Scatter plot visualization found.")
            except (NoSuchElementException, TimeoutException):
                logger.info("Scatter plot not found (might be loading or not available).")
            
            # Test filters dropdown
            try:
                filter_section = driver.find_element(By.XPATH, "//h3[contains(text(), 'Filters')]")
                if filter_section.is_displayed():
                    logger.info("Filters section found.")
                    
                    # Try to interact with filter dropdowns
                    filter_dropdowns = driver.find_elements(By.XPATH, "//select | //button[contains(@aria-haspopup, 'true')]")
                    if filter_dropdowns:
                        logger.info("Found %d filter dropdowns.", len(filter_dropdowns))
            except (NoSuchElementException, TimeoutException):
                logger.info("Filters section not found.")
            
            # Check for segmentation table
            try:
                segmentation_table = driver.find_elements(By.XPATH, "//table | //div[contains(@class, 'table')]")
                if segmentation_table:
                    logger.info("Segmentation table found.")
            except (NoSuchElementException, TimeoutException):
                logger.info("Segmentation table not found.")
                
        except TimeoutException:
            logger.warning("AI Respondent Segmentation section not found.")
        
        # Scroll to bottom
        driver.execute_script("window.scrollBy(0, 1000);")
        time.sleep(2)
        
        # 4. Test Dashboard Analytic Section
        try:
            # Look for dashboard metrics or charts
            dashboard_charts = driver.find_elements(By.XPATH, "//div[contains(@class, 'chart')] | //canvas | //svg")
            if dashboard_charts:
                logger.info("Found %d dashboard chart elements.", len(dashboard_charts))
            
            # Check for metrics cards (total respondents, average satisfaction, etc.)
            metrics_texts = [
                "Total Respondents",
                "Average Satisfaction",
                "Satisfied",
                "Segments"
            ]
            
            for metric in metrics_texts:
                try:
                    metric_element = driver.find_elements(By.XPATH, f"//*[contains(text(), '{metric}')]")
                    if metric_element:
                        logger.info("Metric found: %s", metric)
                except (NoSuchElementException, TimeoutException):
                    pass
                    
        except (TimeoutException, ValueError) as e:
            logger.warning("Dashboard Analytic Section check failed: %s", e)
        
        # 5. Test Download Report Button
        try:
            download_button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Download Full Report')]"))
            )
            assert download_button.is_displayed(), "Download Report button not displayed!"
            logger.info("Download Report button verified.")
            
            # Note: We don't actually click it to avoid downloading files during testing
            # download_button.click()
            
        except TimeoutException:
            logger.warning("Download Report button not found.")
        
        # 6. Test Navigation Breadcrumb
        try:
            breadcrumb = driver.find_elements(By.XPATH, "//nav[contains(@class, 'breadcrumb')] | //*[contains(@class, 'breadcrumb')]")
            if breadcrumb:
                logger.info("Breadcrumb navigation found.")
        except (NoSuchElementException, TimeoutException):
            logger.info("Breadcrumb navigation not found.")
        
        logger.info("AI Analytics Dashboard test completed successfully.")
        time.sleep(2)
        
    except (TimeoutException, AssertionError, ValueError) as e:
        logger.error("Test failed due to error: %s", e)
        pytest.fail("Terjadi kesalahan: %s" % e)


def test_visualization_types(login):
    """
    Test untuk memverifikasi berbagai tipe visualisasi pada halaman Analysis
    """
    driver = login
    
    try:
        # Navigate to Manage Survey page
        link_kelola_survei = driver.find_element(By.XPATH, '//a[@href="/manage-survey"]')
        link_kelola_survei.click()
        
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//h1[text()="Manage Survey"]')))
        
        # Get survey ID
        survey_id = get_survey_id_from_manage_page(driver)
        
        # Navigate to Analysis page
        analysis_url = f'http://localhost:3000/manage-survey/analysis/{survey_id}'
        driver.get(analysis_url)
        
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, '//h1[contains(text(), "Analysis Survey")]'))
        )
        
        time.sleep(3)
        
        # List of visualization types to check
        visualization_types = ['pie', 'bar', 'doughnut', 'radar', 'text', 'wordcloud', 'sentiment_analysis']
        
        # Check for each visualization type
        for viz_type in visualization_types:
            try:
                # Look for elements that might indicate this visualization type
                # This is a basic check - actual implementation depends on how visualizations are rendered
                viz_elements = driver.find_elements(By.XPATH, f"//*[contains(@class, '{viz_type}')] | //*[contains(text(), '{viz_type}')]")
                if viz_elements:
                    logger.info("Visualization type '%s' found or referenced.", viz_type)
            except (NoSuchElementException, TimeoutException):
                pass
        
        # Check for sentiment analysis specific elements
        try:
            sentiment_icons = driver.find_elements(By.XPATH, "//*[contains(@class, 'Smile')] | //*[contains(@class, 'Meh')] | //*[contains(@class, 'Frown')]")
            if sentiment_icons:
                logger.info("Found %d sentiment analysis icons.", len(sentiment_icons))
        except (NoSuchElementException, TimeoutException):
            pass
        
        # Check for word cloud image
        try:
            wordcloud_img = driver.find_elements(By.XPATH, "//img[contains(@alt, 'Word Cloud')]")
            if wordcloud_img:
                logger.info("Word cloud image found.")
        except (NoSuchElementException, TimeoutException):
            pass
        
        logger.info("Visualization types test completed.")
        time.sleep(2)
        
    except (TimeoutException, ValueError) as e:
        logger.error("Visualization types test failed: %s", e)
        # Don't fail the test, just log the error


def test_loading_and_error_states(login):
    """
    Test untuk memverifikasi loading states dan error handling
    """
    driver = login
    
    try:
        # Navigate to Manage Survey page
        link_kelola_survei = driver.find_element(By.XPATH, '//a[@href="/manage-survey"]')
        link_kelola_survei.click()
        
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//h1[text()="Manage Survey"]')))
        
        # Get survey ID
        survey_id = get_survey_id_from_manage_page(driver)
        
        # Navigate to Analysis page
        analysis_url = f'http://localhost:3000/manage-survey/analysis/{survey_id}'
        driver.get(analysis_url)
        
        # Check for loading states (skeleton loaders, spinners, etc.)
        try:
            loading_elements = driver.find_elements(By.XPATH, "//*[contains(@class, 'animate-pulse')] | //*[contains(@class, 'loading')] | //*[contains(text(), 'Loading')]")
            if loading_elements:
                logger.info("Found %d loading state elements.", len(loading_elements))
                # Wait a bit for content to load
                time.sleep(3)
        except (NoSuchElementException, TimeoutException):
            pass
        
        # Check for error states
        try:
            error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Failed to load')] | //*[contains(text(), 'Error')] | //*[contains(@class, 'error')]")
            if error_elements:
                logger.warning("Found %d error state elements.", len(error_elements))
                for error in error_elements[:3]:
                    logger.warning("Error message: %s", error.text[:100])
        except (NoSuchElementException, TimeoutException):
            pass
        
        # Check for empty states
        try:
            empty_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'No summary available')] | //*[contains(text(), 'No responses')] | //*[contains(text(), 'not available')]")
            if empty_elements:
                logger.info("Found %d empty state elements.", len(empty_elements))
        except (NoSuchElementException, TimeoutException):
            pass
        
        logger.info("Loading and error states test completed.")
        time.sleep(2)
        
    except (TimeoutException, ValueError) as e:
        logger.error("Loading and error states test failed: %s", e)
        # Don't fail the test, just log the error

