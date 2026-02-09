---
title: "Broadcast Join for Small Lookup Table"
difficulty: "Medium"
tags: ["join", "broadcast", "optimization", "pyspark"]
tables:
  - name: sales
    visible_data: |
      id,region_id,product,amount
      1,1,Laptop,999
      2,2,Phone,699
      3,1,Tablet,499
      4,3,Monitor,349
      5,2,Keyboard,79
    hidden_datasets:
      - |
        id,region_id,product,amount
        1,1,Camera,599
        2,1,Lens,299
        3,2,Tripod,149
      - |
        id,region_id,product,amount
        1,1,Book,29
        2,2,Pen,5
        3,3,Notebook,15
        4,1,Marker,8
        5,2,Eraser,3
        6,3,Ruler,7
  - name: regions
    visible_data: |
      region_id,region_name
      1,East
      2,West
      3,Central
    hidden_datasets:
      - |
        region_id,region_name
        1,North
        2,South
      - |
        region_id,region_name
        1,Urban
        2,Suburban
        3,Rural
expected_output_query: |
  result = sales.join(broadcast(regions), "region_id", "inner")
---

# Broadcast Join for Small Lookup Table

Join the large `sales` DataFrame with the small `regions` lookup table using a broadcast join for better performance.

Use `broadcast()` to hint that the small table should be broadcast to all workers.

Your result should be stored in a variable called `result`.

**Hint:** Use `sales.join(broadcast(regions), "region_id", "inner")`.

## Expected Output
region_id,id,product,amount,region_name
1,1,Laptop,999,East
2,2,Phone,699,West
1,3,Tablet,499,East
3,4,Monitor,349,Central
2,5,Keyboard,79,West
