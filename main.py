import argparse
import requests
from urllib.error import URLError
from VulnerabilityScanner.enum import CommonPortsCheck
from VulnerabilityScanner.components.Crawler import Crawler
from VulnerabilityScanner.components.ReportGenerator import ReportGenerator
from VulnerabilityScanner.SecurityHeaders import SecurityHeaders
from VulnerabilityScanner.XssScanner import XssScanner
from VulnerabilityScanner.outdated import Outdated
from VulnerabilityScanner.sqli import singlescan
from VulnerabilityScanner.crypto import *
from VulnerabilityScanner.components.terminalColors import TerminalColors
from tenacity import retry, stop_after_attempt, wait_exponential


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def perform_http_request(url):
    response = requests.get(url)
    response.raise_for_status()
    return response


def perform_scans(quiet, givenurl, urls, xsspayload, nohttps, sqlipayloads, scan_types, report):
    if not scan_types:
        scan_types = ['enum', 'headers', 'xss', 'sqli', 'outdated', 'crypto']
    try:
        response = perform_http_request(givenurl)
        if response.status_code != 200:
            print(f"Error: HTTP {response.status_code}")
        for scan_type in scan_types:
            if scan_type == 'enum':
                run_port_scans(givenurl, report, quiet)
            elif scan_type == 'headers':
                run_header_scans(givenurl, report, quiet, nohttps)
            elif scan_type == 'xss':
                run_xss_scans(urls, report, quiet, xsspayload)
            elif scan_type == 'sqli':
                run_sqli_scans(urls, report, quiet, sqlipayloads)
            elif scan_type == 'crypto':
                run_crypto_scans(urls, report)
            elif scan_type == 'outdated':
                run_outdated_scans(givenurl, report)

    except (requests.exceptions.RequestException, URLError) as e:
        print(
            f"{TerminalColors.FAIL}Connection to: {givenurl} could not be established, error: {e}{TerminalColors.ENDC}")
        exit()


def run_crypto_scans(urls, report):
    print(f"{TerminalColors.OKBLUE}Initiating Crpyptographic Failure scans on collected URLs{TerminalColors.ENDC}")
    testConnection(urls[0], report)
    print(f"{TerminalColors.OKBLUE}Cryptographic failure scans completed{TerminalColors.ENDC}")

def run_xss_scans(urls, report, quiet, xsspayload):
    print(f"{TerminalColors.OKBLUE}Initiating XSS scans on collected URLs{TerminalColors.ENDC}")
    for url in urls:
        print(f"{TerminalColors.HEADER}Scanning for XSS on: {url}{TerminalColors.ENDC}")
        xss_scan = XssScanner(quiet, url, set())
        xss_scan.scan_host(report, xsspayload)
    print(f"{TerminalColors.OKBLUE}XSS scans completed{TerminalColors.ENDC}")


def run_port_scans(givenurl, report, quiet):
    ports = CommonPortsCheck(quiet)
    print(f"{TerminalColors.OKBLUE}Scanning common ports for {givenurl}{TerminalColors.ENDC}")
    ports.scan_ports(givenurl, report)


def run_header_scans(url, report, quiet, nohttps):
    print(f"{TerminalColors.OKBLUE}Checking security headers for collected URLs{TerminalColors.ENDC}")
    print(f"Checking security headers for: {url}")
    secheaders = SecurityHeaders(url, quiet, nohttps)
    secheaders.check_security_headers(report, url)
    print(f"{TerminalColors.OKBLUE}Header scans completed{TerminalColors.ENDC}")


def run_sqli_scans(urls, report, quiet, sqlipayloads):
    print(f"{TerminalColors.OKBLUE}Initiating SQL injection scans on collected URLs{TerminalColors.ENDC}")
    for url in urls:
        print(f"Scanning for SQL injection on: {url}")
        singlescan(url, report, sqlipayloads, quiet)
    print(f"{TerminalColors.OKBLUE}SQL injection scans completed{TerminalColors.ENDC}")


def run_outdated_scans(givenurl, report):
    print(f"{TerminalColors.OKBLUE}Initiating outdated component scans on collected URLs{TerminalColors.ENDC}")
    print(f"Scanning for outdated components on: {givenurl}")
    tester = Outdated(givenurl)
    tester.run_tests(report)
    print(f"{TerminalColors.OKBLUE}Outdated component scans completed{TerminalColors.ENDC}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-q', '--quiet', help='quiet mode - no console output generated', dest='quiet',
                        action='store_true')
    parser.add_argument('-d', '--depth', help='Provide depth for crawling', dest='depth')
    parser.add_argument('-u', '--url', help='Provide URL for a web application, example: https://www.example.com',
                        required=True, dest='url')
    parser.add_argument('-xp', '--xsspayload', help='Path to XSS payload', dest='xsspayload')
    parser.add_argument('-nh', '--nohttps', help="Don't check for https header", dest='nohttps', action='store_true')
    parser.add_argument('-sp', '--sqlipayload', help='Path to SQLi payload file', dest='sqlipayload')
    parser.add_argument('--scan-type',
                        help='Specify which scans to perform (comma-separated: xss, sqli, outdated,enum,headers)',
                        dest='scan_types', type=str)
    arguments = parser.parse_args()

    try:
        response = perform_http_request(arguments.url)
        print(f"{TerminalColors.OKGREEN}Site responded with code {response.status_code}{TerminalColors.ENDC}")
    except (requests.exceptions.RequestException, URLError) as e:
        print(
            f"{TerminalColors.FAIL}Connection to: {arguments.url} could not be established, error:"
            f" {e}{TerminalColors.ENDC}")
        exit()

    url_len = len(arguments.url)
    if arguments.url[url_len - 1] == '/':
        arguments.url = arguments.url[:-1]

    max_depth = int(arguments.depth) if arguments.depth else 3
    report = ReportGenerator(arguments.url)
    print("Crawling...")
    urls = Crawler.deep_crawl(arguments.url, max_depth=max_depth)
    print("Collected URLs:")
    for url in urls:
        print(url)
    report.add_collected_urls(urls)
    sqlipayloads = []
    if arguments.sqlipayload:
        with open(arguments.sqlipayload, 'r') as file:
            sqlipayloads = file.read().splitlines()
    scan_types = arguments.scan_types.split(',') if arguments.scan_types else ['enum', 'headers', 'xss', 'sqli',
                                                                               'outdated', 'crypto']

    perform_scans(arguments.quiet, arguments.url, urls, arguments.xsspayload, arguments.nohttps, sqlipayloads,
                  scan_types, report)


if __name__ == '__main__':
    main()
