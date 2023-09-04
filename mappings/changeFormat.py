import json

def int_to_address(int_value):
    hex_str = hex(int_value)[2:]  # remove the '0x' prefix
    return '0x' + hex_str.zfill(40)  # pad with zeros

# Load the JSON data
with open('input.json') as f:
    data = json.load(f)

# Open the text file to write
with open('fiatCurrencies.txt', 'w') as f:
    for item in data:
        # Get the numeric and alphabetic codes
        numeric_code = item['Numeric Code']
        alpha_code = item['Alphabetic Code']
        # Convert numeric code to an Ethereum address
        address = int_to_address(int(numeric_code))
        # Write the line to the file
        f.write(f'fiatCurrencies.set("{address}", "{alpha_code}");\n')