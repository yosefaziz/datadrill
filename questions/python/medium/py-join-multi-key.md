---
title: "Year-Over-Year Sales Comparison"
difficulty: "Medium"
interview_relevant: false
tags: ["pyspark", "join", "composite key"]
tables:
  - name: sales_2023
    visible_data: |
      region,product,revenue_2023
      East,Laptop,50000
      East,Phone,30000
      West,Laptop,45000
      West,Phone,35000
    hidden_datasets:
      - |
        region,product,revenue_2023
        North,Camera,20000
        South,Camera,15000
      - |
        region,product,revenue_2023
        Central,Book,5000
        Central,Pen,2000
        Coastal,Book,4000
  - name: sales_2024
    visible_data: |
      region,product,revenue_2024
      East,Laptop,55000
      East,Phone,32000
      West,Laptop,48000
      West,Phone,38000
    hidden_datasets:
      - |
        region,product,revenue_2024
        North,Camera,22000
        South,Camera,18000
      - |
        region,product,revenue_2024
        Central,Book,6000
        Central,Pen,2500
        Coastal,Book,4500
expected_output_query: |
  result = sales_2023.join(sales_2024, ["region", "product"], "inner")
---

# Year-Over-Year Sales Comparison

Join `sales_2023` and `sales_2024` on both `region` AND `product` to compare year-over-year revenue.

When joining on multiple columns that share the same name, pass a list of column names.

Your result should be stored in a variable called `result`.


## Expected Output
region,product,revenue_2023,revenue_2024
East,Laptop,50000,55000
East,Phone,30000,32000
West,Laptop,45000,48000
West,Phone,35000,38000
