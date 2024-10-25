import openpyxl
import re
from openpyxl.formula import Tokenizer

workbook = openpyxl.open("test_excel.xlsx")

# Dictionary to hold tokens for each worksheet
all_tokens = {}

# Loop through all worksheets in the workbook
for worksheet in workbook.worksheets:
    tokens = []
    
    # Iterate over each row and tokenize cell values
    for row in worksheet.rows:
        for cell in row:
          print(Tokenizer(str(cell.value)))
          row_tokens = [Tokenizer(cell) for cell in row]
          for token in row_tokens:
            print(token.items)
          tokens.append(row_tokens)
    
    # Store the tokens for this worksheet by sheet name
    all_tokens[worksheet.title] = tokens

# `all_tokens` now contains the tokenized data for all worksheets
# print(all_tokens)

# for sheetName in all_tokens:
#    tokens = all_tokens[sheetName]
#    print(sheetName, )
