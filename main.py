import argparse
import urllib.request
from urllib.error import URLError, HTTPError
from VulnerabilityScanner.CommonPortsCheck import CommonPortsCheck
from VulnerabilityScanner.Crawler import Crawler
from VulnerabilityScanner.ReportGenerator import ReportGenerator
from VulnerabilityScanner.SecurityHeaders import SecurityHeaders
from VulnerabilityScanner.XssScanner import XssScanner
from VulnerabilityScanner.outdated import OWASPTop10Tester
from VulnerabilityScanner.sqli import singlescan
from VulnerabilityScanner.src.terminalColors import TerminalColors


def perform_scans(quiet, givenurl, urls, xsspayload, nohttps, sqlipayloads, threads):
    global_vulnerabilities = set()
    report = ReportGenerator(givenurl)

    ports = CommonPortsCheck(quiet)
    ports.scan_ports(givenurl, report)

    secheaders = SecurityHeaders(givenurl, quiet, nohttps)
    secheaders.check_security_headers(report)

    if urls:
        for url in urls:
            if not quiet:
                print(f"\n{TerminalColors.HEADER}[*****]  Checking URL: {url}  [*****]{TerminalColors.ENDC}\n")

            attacks(report, url, quiet, xsspayload, sqlipayloads, global_vulnerabilities, threads)
    else:
        attacks(report, givenurl, quiet, xsspayload, sqlipayloads, global_vulnerabilities, threads)


def attacks(report, url, quiet, xsspayload, sqlipayloads, vulnerability_tracker, threads):
    print(f"{TerminalColors.OKBLUE}XSS scan is starting{TerminalColors.ENDC}")
    xss_scan = XssScanner(quiet, url, vulnerability_tracker)
    xss_scan.scan_host(report, xsspayload)
    print(f"{TerminalColors.OKBLUE}XSS scan finished{TerminalColors.ENDC}")
    print(f"{TerminalColors.OKBLUE}SQLI scan is starting{TerminalColors.ENDC}")
    singlescan(url, report, sqlipayloads, threads)
    print(f"{TerminalColors.OKBLUE}SQLI scan finished{TerminalColors.ENDC}")
    print(f"{TerminalColors.OKBLUE}Outdated component scan starting{TerminalColors.ENDC}")
    tester = OWASPTop10Tester(url)
    tester.run_tests(report)
    print(f"{TerminalColors.OKBLUE}Outdated component scan finished{TerminalColors.ENDC}")


def main():
    xsspayload = ''
    urls = []
    sqlipayloads = []

    parser = argparse.ArgumentParser()
    parser.add_argument('-q', '--quiet', help='quiet mode - no console output generated', dest='quiet',
                        action='store_true')
    parser.add_argument('-u', '--url', help='Provide URL for a web application, example: https://www.example.com',
                        required=True, dest='url')
    parser.add_argument('-xp', '--xsspayload', help='Path to XSS payload', dest='xsspayload')
    parser.add_argument('-nh', '--nohttps', help="Don't check for https header", dest='nohttps', action='store_true')
    parser.add_argument('-sp', '--sqlipayload', help='Path to SQLi payload file', dest='sqlipayload')
    parser.add_argument('-t', '--threads', help='Set threads for multiprocessing', dest='threads', type=int, default=1)
    arguments = parser.parse_args()

    try:
        check_site = urllib.request.urlopen(arguments.url)
        print(f"{TerminalColors.OKGREEN}Site responded with code {check_site.getcode()}{TerminalColors.ENDC}")
    except (HTTPError, URLError) as e:
        print(f"{TerminalColors.FAIL}Connection to: {arguments.url} could not be established, error code:"
              f" {e}{TerminalColors.ENDC}")
        exit()

    url_len = len(arguments.url)
    if arguments.url[url_len - 1] == '/':
        arguments.url = arguments.url[:-1]

    print(arguments.url)

    if arguments.xsspayload:
        xsspayload = arguments.xsspayload

    if arguments.sqlipayload:
        with open(arguments.sqlipayload, 'r') as file:
            sqlipayloads = file.read().splitlines()

    threads = arguments.threads
    perform_scans(arguments.quiet, arguments.url, urls, xsspayload, arguments.nohttps, sqlipayloads, threads)


if __name__ == '__main__':
    main()
