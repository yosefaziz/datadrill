---
title: "Select and Rename Columns"
difficulty: "Medium"
interview_relevant: false
tags: ["pyspark", "select", "alias", "withColumnRenamed"]
tables:
  - name: raw_data
    visible_data: |
      id,first_name,last_name,email_address,phone_number
      1,Alice,Smith,alice@example.com,555-0101
      2,Bob,Jones,bob@example.com,555-0102
      3,Charlie,Brown,charlie@example.com,555-0103
      4,Diana,Lee,diana@example.com,555-0104
    hidden_datasets:
      - |
        id,first_name,last_name,email_address,phone_number
        1,Eve,Wilson,eve@test.com,555-0201
        2,Frank,Davis,frank@test.com,555-0202
      - |
        id,first_name,last_name,email_address,phone_number
        1,Grace,Miller,grace@demo.com,555-0301
        2,Henry,Taylor,henry@demo.com,555-0302
        3,Ivy,Anderson,ivy@demo.com,555-0303
        4,Jack,Thomas,jack@demo.com,555-0304
        5,Kate,White,kate@demo.com,555-0305
expected_output_query: |
  result = raw_data.select(col("id"), col("first_name").alias("first"), col("last_name").alias("last"), col("email_address").alias("email"))
---

# Select and Rename Columns

Select and rename columns from the `raw_data` DataFrame.

Keep `id` as-is, rename `first_name` to `first`, `last_name` to `last`, and `email_address` to `email`. Drop `phone_number`.

Your result should be stored in a variable called `result`.


## Expected Output
id,first,last,email
1,Alice,Smith,alice@example.com
2,Bob,Jones,bob@example.com
3,Charlie,Brown,charlie@example.com
4,Diana,Lee,diana@example.com
