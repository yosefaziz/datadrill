---
title: "Annual Sales Growth by Category"
difficulty: "Medium"
tags: ["self-join", "YoY", "growth"]
track: sql-yoy-growth
track_level: 2
track_order: 1
hints:
  - "Consider how to pair each year's row with the row from the same category one year earlier - you need to match rows from two copies of the same table."
  - "A self-join lets you alias the table twice. Join on matching category and a year offset condition so each row connects to its predecessor."
  - "Join yearly_sales curr to yearly_sales prev ON curr.category = prev.category AND curr.year = prev.year + 1, then compute the difference and percentage."
tables:
  - name: yearly_sales
    visible_data: |
      year,category,total_sales
      2022,Electronics,340000
      2022,Apparel,215000
      2022,Home Goods,178000
      2023,Electronics,385000
      2023,Apparel,198000
      2023,Home Goods,195000
      2024,Electronics,412000
      2024,Apparel,221000
      2024,Home Goods,187000
    hidden_datasets:
      - |
        year,category,total_sales
        2021,Electronics,290000
        2021,Apparel,200000
        2022,Electronics,310000
        2022,Apparel,180000
        2023,Electronics,350000
        2023,Apparel,195000
      - |
        year,category,total_sales
        2022,Furniture,95000
        2023,Furniture,110000
        2024,Furniture,105000
        2022,Toys,60000
        2024,Toys,72000
expected_output_query: "SELECT curr.year, curr.category, curr.total_sales AS current_sales, prev.total_sales AS prev_year_sales, curr.total_sales - prev.total_sales AS yoy_growth FROM yearly_sales curr JOIN yearly_sales prev ON curr.category = prev.category AND curr.year = prev.year + 1 ORDER BY curr.year, curr.category"
---

# Annual Sales Growth by Category

Write a query that compares each category's annual sales to the previous year's sales and computes the year-over-year growth amount. Each row should show the current year's sales alongside the prior year's sales for the same category.

Only include rows where previous year data exists for that category. Return `year`, `category`, `current_sales`, `prev_year_sales`, and `yoy_growth`. Order by `year`, then `category`.

## Expected Output
year,category,current_sales,prev_year_sales,yoy_growth
2023,Apparel,198000,215000,-17000
2023,Electronics,385000,340000,45000
2023,Home Goods,195000,178000,17000
2024,Apparel,221000,198000,23000
2024,Electronics,412000,385000,27000
2024,Home Goods,187000,195000,-8000
