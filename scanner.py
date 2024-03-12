import argparse
import urllib.request
from urllib.error import URLError, HTTPError
from VulnerabilityScanner.CommonPortsCheck import CommonPortsCheck
from VulnerabilityScanner.Crawler import Crawler
from VulnerabilityScanner.ReportGenerator import ReportGenerator
from VulnerabilityScanner.SecurityHeaders import SecurityHeaders
from VulnerabilityScanner.XssScanner import XssScanner
from VulnerabilityScanner.SQLiScanner import SQLiScanner  # Import SQLiScanner


def perform_scans(quiet, givenurl, urls, xsspayload, nohttps, sqlipayload):
    """
    Function performing scans and executing attacks
    """
    global_vulnerabilities = set()
    # Create a report instance
    report = ReportGenerator(givenurl)

    # Check common ports
    ports = CommonPortsCheck(quiet)
    ports.scan_ports(givenurl, report)

    # Check security headers for the main URL
    secheaders = SecurityHeaders(givenurl, quiet, nohttps)
    secheaders.check_security_headers(report)

    if urls:
        for url in urls:
            report.write_to_report(f"\n [*****]  Checking URL: {url}  [*****] \n")
            if not quiet:
                print(f"\n [*****]  Checking URL: {url}  [*****] \n")
            # Execute attacks for each URL
            attacks(report, url, quiet, xsspayload, global_vulnerabilities, sqlipayload)
    else:
        # Execute attacks for the given URL
        attacks(report, givenurl, quiet, xsspayload, global_vulnerabilities, sqlipayload)


def attacks(report, url, quiet, xsspayload, vulnerability_tracker, sqli_payload):
    """
    Execute attacks for the provided URL
    """
    # Scan for XSS vulnerabilities
    xss_scan = XssScanner(quiet, url, vulnerability_tracker)
    xss_scan.scan_host(report, xsspayload)

    # Scan for SQL injection vulnerabilities (assuming SQLiScanner.py defines SQLiScanner class)
    sqli_scan = SQLiScanner(quiet, url, vulnerability_tracker)  # Create SQLiScanner instance
    sqli_scan.scan_host(report, sqli_payload)  # Pass sqli_payloads to scan_host method for SQL injection scan


def main():
    xsspayload = ''
    sqli_payloads = ''  # Initialize SQL injection payloads variable
    urls = []

    # Argument parsing
    parser = argparse.ArgumentParser()
    parser.add_argument('-c', '--crawler', help='Crawl to provided depth', dest='crawler', type=int, default=1)
    parser.add_argument('-q', '--quiet', help='quiet mode - no console output generated', dest='quiet',
                        action='store_true')
    parser.add_argument('-u', '--url', help='Provide URL for a web application, example: https://www.example.com',
                        required=True, dest='url')
    parser.add_argument('-xp', '--xsspayload', help='Path to XSS payload', dest='xsspayload')
    parser.add_argument('-sp', '--sqli_payload', help='Path to SQL injection payloads', dest='sqli_payload')
    parser.add_argument('-nh', '--nohttps', help="Don't check for https header", dest='nohttps', action='store_true')
    arguments = parser.parse_args()

    # Check if the provided URL is accessible
    try:
        check_site = urllib.request.urlopen(arguments.url)
        print("Site responded with code " + str(check_site.getcode()))
    except (HTTPError, URLError) as e:
        print("Connection to: " + arguments.url + " could not be established, error code: " + str(e))
        exit()

    # Remove trailing '/' from the URL
    url_len = len(arguments.url)
    if arguments.url[url_len - 1] == '/':
        arguments.url = arguments.url[:-1]

    # Output the processed URL
    print(arguments.url)

    # Set XSS payload if provided
    if arguments.xsspayload:
        xsspayload = arguments.xsspayload

    # Set SQL injection payloads if provided
    if arguments.sqli_payload:
        sqli_payloads = arguments.sqli_payload

    # Crawl and get URLs if crawling depth is specified
    if arguments.crawler:
        urls = Crawler.deep_crawl(arguments.url, arguments.crawler)
        if arguments.url not in urls:
            urls.append(arguments.url)

    # Perform scans and execute attacks
    perform_scans(arguments.quiet, arguments.url, urls, xsspayload, arguments.nohttps, sqli_payloads)


if __name__ == '__main__':
    main()
