# -*- coding: utf-8 -*-
"""
Created on Wed Apr 24 14:48:49 2024

@author: My
"""

import pandas as pd

dk_df = pd.read_excel('DK rando spreadsheet.xlsx')

dk_df = dk_df.sort_values(by='Difficulty')

print(dk_df)

def wrap_in_quotes(content):
    return '"' + content + '"'

def make_js_entry(row):
    goal_id = row['Id']
    goal_name = wrap_in_quotes(row['Name'])
    goal_type = row['Type']
    if pd.isnull(goal_type):
        goal_type = ''
    else:
        goal_type = wrap_in_quotes(goal_type)
    goal_subtype = row['Subtype']
    if pd.isnull(goal_subtype):
        goal_subtype = ''
    else:
        goal_subtype = wrap_in_quotes(goal_subtype)
    js_entry = f"{{ \"id\": {goal_id}, \"name\": {goal_name}, \"types\": [{goal_type}], \"subtypes\": [{goal_subtype}], \"weight\": 1}},"
    return js_entry
    

def write_to_js(df, file_path):
    js_content = ''
    js_content += 'var bingoList = [];'
    js_content += '\n\n'
    
    current_difficulty = 1
    js_content += 'bingoList[1] = [\n'
    for index, row in df.iterrows():
        
        difficulty = row['Difficulty']
        if difficulty != current_difficulty:
            js_content += '];\n\n'
            js_content += f'bingoList[{difficulty}] = [\n'
            current_difficulty = difficulty
        
        js_content += make_js_entry(row)
        js_content += '\n'
    
    js_content += '];\n\n'
    
    js_content += 'bingoList[26] = [];\n\n'
    js_content += 'bingoList["info"] = {version: "v2024.0"};'
    
    with open(file_path, 'w') as file:
        file.write(js_content)

write_to_js(dk_df, "dk_rando.js")