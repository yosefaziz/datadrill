# Mock PySpark module for DataDrill
# This provides a subset of PySpark DataFrame API that runs in-browser via Pyodide

from typing import List, Dict, Any, Optional, Callable, Union
import json
import builtins

# Save references to Python's built-in functions before they might be shadowed
_builtin_sum = builtins.sum
_builtin_min = builtins.min
_builtin_max = builtins.max

class Column:
    """Represents a column expression in a DataFrame."""

    def __init__(self, name: str, expr: Optional[Callable] = None):
        self._name = name
        self._expr = expr or (lambda row: row.get(name))

    def __repr__(self):
        return f"Column({self._name})"

    def alias(self, name: str) -> 'Column':
        """Return a column with a new name."""
        return Column(name, self._expr)

    def __eq__(self, other) -> 'Column':
        """Column equality comparison."""
        def eq_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val == other_val
        return Column(f"{self._name}_eq", eq_expr)

    def __ne__(self, other) -> 'Column':
        """Column inequality comparison."""
        def ne_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val != other_val
        return Column(f"{self._name}_ne", ne_expr)

    def __lt__(self, other) -> 'Column':
        """Less than comparison."""
        def lt_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val < other_val
        return Column(f"{self._name}_lt", lt_expr)

    def __le__(self, other) -> 'Column':
        """Less than or equal comparison."""
        def le_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val <= other_val
        return Column(f"{self._name}_le", le_expr)

    def __gt__(self, other) -> 'Column':
        """Greater than comparison."""
        def gt_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val > other_val
        return Column(f"{self._name}_gt", gt_expr)

    def __ge__(self, other) -> 'Column':
        """Greater than or equal comparison."""
        def ge_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val >= other_val
        return Column(f"{self._name}_ge", ge_expr)

    def __add__(self, other) -> 'Column':
        """Addition."""
        def add_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val + other_val
        return Column(f"{self._name}_add", add_expr)

    def __sub__(self, other) -> 'Column':
        """Subtraction."""
        def sub_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val - other_val
        return Column(f"{self._name}_sub", sub_expr)

    def __mul__(self, other) -> 'Column':
        """Multiplication."""
        def mul_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val * other_val
        return Column(f"{self._name}_mul", mul_expr)

    def __truediv__(self, other) -> 'Column':
        """Division."""
        def div_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val / other_val if other_val != 0 else None
        return Column(f"{self._name}_div", div_expr)

    def __and__(self, other) -> 'Column':
        """Logical AND."""
        def and_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val and other_val
        return Column(f"{self._name}_and", and_expr)

    def __or__(self, other) -> 'Column':
        """Logical OR."""
        def or_expr(row):
            val = self._expr(row)
            other_val = other._expr(row) if isinstance(other, Column) else other
            return val or other_val
        return Column(f"{self._name}_or", or_expr)

    def isNull(self) -> 'Column':
        """Check if value is null."""
        def null_expr(row):
            return self._expr(row) is None
        return Column(f"{self._name}_isnull", null_expr)

    def isNotNull(self) -> 'Column':
        """Check if value is not null."""
        def notnull_expr(row):
            return self._expr(row) is not None
        return Column(f"{self._name}_isnotnull", notnull_expr)

    def isin(self, *values) -> 'Column':
        """Check if value is in list."""
        def isin_expr(row):
            return self._expr(row) in values
        return Column(f"{self._name}_isin", isin_expr)

    def asc(self) -> 'Column':
        """Sort ascending."""
        col = Column(self._name, self._expr)
        col._sort_order = 'asc'
        return col

    def desc(self) -> 'Column':
        """Sort descending."""
        col = Column(self._name, self._expr)
        col._sort_order = 'desc'
        return col


def col(name: str) -> Column:
    """Create a column reference."""
    return Column(name)


def lit(value: Any) -> Column:
    """Create a literal value column."""
    return Column(f"lit_{value}", lambda row: value)


# Aggregation functions
def _make_agg(name: str, func: Callable) -> Callable:
    def agg_func(column: Union[str, Column]) -> Column:
        col_name = column if isinstance(column, str) else column._name
        agg_col = Column(f"{name}({col_name})")
        agg_col._agg_func = func
        agg_col._agg_col = col_name
        return agg_col
    return agg_func


def count(column: Union[str, Column] = "*") -> Column:
    """Count aggregation."""
    col_name = column if isinstance(column, str) else column._name
    agg_col = Column(f"count({col_name})")
    agg_col._agg_func = lambda vals: len([v for v in vals if v is not None]) if col_name != "*" else len(vals)
    agg_col._agg_col = col_name
    return agg_col


def sum(column: Union[str, Column]) -> Column:
    """Sum aggregation."""
    col_name = column if isinstance(column, str) else column._name
    agg_col = Column(f"sum({col_name})")
    agg_col._agg_func = lambda vals: _builtin_sum([v for v in vals if v is not None])
    agg_col._agg_col = col_name
    return agg_col


def avg(column: Union[str, Column]) -> Column:
    """Average aggregation."""
    col_name = column if isinstance(column, str) else column._name
    agg_col = Column(f"avg({col_name})")
    def avg_func(vals):
        non_null = [v for v in vals if v is not None]
        return _builtin_sum(non_null) / len(non_null) if non_null else None
    agg_col._agg_func = avg_func
    agg_col._agg_col = col_name
    return agg_col


def max(column: Union[str, Column]) -> Column:
    """Max aggregation."""
    col_name = column if isinstance(column, str) else column._name
    agg_col = Column(f"max({col_name})")
    agg_col._agg_func = lambda vals: _builtin_max([v for v in vals if v is not None]) if vals else None
    agg_col._agg_col = col_name
    return agg_col


def min(column: Union[str, Column]) -> Column:
    """Min aggregation."""
    col_name = column if isinstance(column, str) else column._name
    agg_col = Column(f"min({col_name})")
    agg_col._agg_func = lambda vals: _builtin_min([v for v in vals if v is not None]) if vals else None
    agg_col._agg_col = col_name
    return agg_col


class GroupedData:
    """Represents a grouped DataFrame."""

    def __init__(self, df: 'DataFrame', group_cols: List[str]):
        self._df = df
        self._group_cols = group_cols

    def agg(self, *exprs) -> 'DataFrame':
        """Apply aggregations to groups."""
        # Group the data
        groups: Dict[tuple, List[Dict]] = {}
        for row in self._df._data:
            key = tuple(row.get(col) for col in self._group_cols)
            if key not in groups:
                groups[key] = []
            groups[key].append(row)

        # Apply aggregations
        result_data = []
        for key, rows in groups.items():
            result_row = {}
            # Add group columns
            for i, col in enumerate(self._group_cols):
                result_row[col] = key[i]
            # Apply each aggregation
            for expr in exprs:
                if hasattr(expr, '_agg_func') and hasattr(expr, '_agg_col'):
                    col_name = expr._agg_col
                    if col_name == "*":
                        values = rows
                    else:
                        values = [r.get(col_name) for r in rows]
                    result_row[expr._name] = expr._agg_func(values)
            result_data.append(result_row)

        # Determine result columns
        result_cols = list(self._group_cols) + [expr._name for expr in exprs if hasattr(expr, '_agg_func')]
        return DataFrame(result_data, result_cols)

    def count(self) -> 'DataFrame':
        """Count rows in each group."""
        return self.agg(count("*").alias("count"))


class DataFrame:
    """Mock PySpark DataFrame."""

    def __init__(self, data: List[Dict[str, Any]], columns: Optional[List[str]] = None):
        self._data = data
        if columns:
            self._columns = columns
        elif data:
            self._columns = list(data[0].keys())
        else:
            self._columns = []

    @property
    def columns(self) -> List[str]:
        """Return column names."""
        return self._columns

    def select(self, *cols) -> 'DataFrame':
        """Select columns."""
        selected_cols = []
        col_exprs = []

        for c in cols:
            if isinstance(c, str):
                selected_cols.append(c)
                col_exprs.append(Column(c))
            elif isinstance(c, Column):
                selected_cols.append(c._name)
                col_exprs.append(c)

        result_data = []
        for row in self._data:
            new_row = {}
            for col_name, col_expr in zip(selected_cols, col_exprs):
                new_row[col_name] = col_expr._expr(row)
            result_data.append(new_row)

        return DataFrame(result_data, selected_cols)

    def filter(self, condition: Column) -> 'DataFrame':
        """Filter rows based on condition."""
        result_data = [row for row in self._data if condition._expr(row)]
        return DataFrame(result_data, self._columns)

    def where(self, condition: Column) -> 'DataFrame':
        """Alias for filter."""
        return self.filter(condition)

    def groupBy(self, *cols) -> GroupedData:
        """Group by columns."""
        group_cols = []
        for c in cols:
            if isinstance(c, str):
                group_cols.append(c)
            elif isinstance(c, Column):
                group_cols.append(c._name)
        return GroupedData(self, group_cols)

    def orderBy(self, *cols) -> 'DataFrame':
        """Sort by columns."""
        sort_keys = []
        for c in cols:
            if isinstance(c, str):
                sort_keys.append((c, False))  # ascending by default
            elif isinstance(c, Column):
                reverse = getattr(c, '_sort_order', 'asc') == 'desc'
                sort_keys.append((c._name, reverse))

        result_data = list(self._data)
        # Sort by keys in reverse order (last key is primary)
        for col_name, reverse in reversed(sort_keys):
            result_data.sort(key=lambda row: (row.get(col_name) is None, row.get(col_name)), reverse=reverse)

        return DataFrame(result_data, self._columns)

    def sort(self, *cols) -> 'DataFrame':
        """Alias for orderBy."""
        return self.orderBy(*cols)

    def limit(self, n: int) -> 'DataFrame':
        """Limit to first n rows."""
        return DataFrame(self._data[:n], self._columns)

    def distinct(self) -> 'DataFrame':
        """Return distinct rows."""
        seen = set()
        result_data = []
        for row in self._data:
            key = tuple(sorted(row.items()))
            if key not in seen:
                seen.add(key)
                result_data.append(row)
        return DataFrame(result_data, self._columns)

    def drop(self, *cols) -> 'DataFrame':
        """Drop columns."""
        cols_to_drop = set()
        for c in cols:
            if isinstance(c, str):
                cols_to_drop.add(c)
            elif isinstance(c, Column):
                cols_to_drop.add(c._name)

        new_cols = [c for c in self._columns if c not in cols_to_drop]
        result_data = [{k: v for k, v in row.items() if k not in cols_to_drop} for row in self._data]
        return DataFrame(result_data, new_cols)

    def withColumn(self, name: str, col_expr: Column) -> 'DataFrame':
        """Add or replace a column."""
        result_data = []
        for row in self._data:
            new_row = dict(row)
            new_row[name] = col_expr._expr(row)
            result_data.append(new_row)

        new_cols = list(self._columns)
        if name not in new_cols:
            new_cols.append(name)

        return DataFrame(result_data, new_cols)

    def withColumnRenamed(self, existing: str, new: str) -> 'DataFrame':
        """Rename a column."""
        result_data = []
        for row in self._data:
            new_row = {}
            for k, v in row.items():
                new_row[new if k == existing else k] = v
            result_data.append(new_row)

        new_cols = [new if c == existing else c for c in self._columns]
        return DataFrame(result_data, new_cols)

    def join(self, other: 'DataFrame', on: Union[str, List[str], Column], how: str = 'inner') -> 'DataFrame':
        """Join with another DataFrame."""
        # Normalize join keys
        if isinstance(on, str):
            join_keys = [on]
        elif isinstance(on, Column):
            join_keys = [on._name]
        else:
            join_keys = [k if isinstance(k, str) else k._name for k in on]

        result_data = []

        if how == 'inner':
            for left_row in self._data:
                for right_row in other._data:
                    if all(left_row.get(k) == right_row.get(k) for k in join_keys):
                        merged = dict(left_row)
                        for k, v in right_row.items():
                            if k not in join_keys:
                                merged[k] = v
                        result_data.append(merged)

        elif how == 'left' or how == 'left_outer':
            for left_row in self._data:
                matched = False
                for right_row in other._data:
                    if all(left_row.get(k) == right_row.get(k) for k in join_keys):
                        merged = dict(left_row)
                        for k, v in right_row.items():
                            if k not in join_keys:
                                merged[k] = v
                        result_data.append(merged)
                        matched = True
                if not matched:
                    merged = dict(left_row)
                    for k in other._columns:
                        if k not in join_keys:
                            merged[k] = None
                    result_data.append(merged)

        elif how == 'right' or how == 'right_outer':
            for right_row in other._data:
                matched = False
                for left_row in self._data:
                    if all(left_row.get(k) == right_row.get(k) for k in join_keys):
                        merged = dict(left_row)
                        for k, v in right_row.items():
                            if k not in join_keys:
                                merged[k] = v
                        result_data.append(merged)
                        matched = True
                if not matched:
                    merged = {}
                    for k in self._columns:
                        merged[k] = None
                    for k in join_keys:
                        merged[k] = right_row.get(k)
                    for k, v in right_row.items():
                        if k not in join_keys:
                            merged[k] = v
                    result_data.append(merged)

        # Determine result columns
        result_cols = list(self._columns) + [c for c in other._columns if c not in join_keys]
        return DataFrame(result_data, result_cols)

    def union(self, other: 'DataFrame') -> 'DataFrame':
        """Union with another DataFrame."""
        return DataFrame(self._data + other._data, self._columns)

    def count(self) -> int:
        """Count rows."""
        return len(self._data)

    def collect(self) -> List[Dict[str, Any]]:
        """Collect all rows."""
        return self._data

    def toPandas(self) -> 'DataFrame':
        """Return self (mock - no actual pandas)."""
        return self

    def show(self, n: int = 20):
        """Print first n rows."""
        print(f"Columns: {self._columns}")
        for row in self._data[:n]:
            print(row)

    def toJSON(self) -> str:
        """Return data as JSON string."""
        return json.dumps({
            "columns": self._columns,
            "data": self._data
        })


class SparkSession:
    """Mock SparkSession."""

    class Builder:
        def __init__(self):
            self._app_name = "DataDrill"

        def appName(self, name: str) -> 'SparkSession.Builder':
            self._app_name = name
            return self

        def master(self, master: str) -> 'SparkSession.Builder':
            return self

        def config(self, key: str, value: str) -> 'SparkSession.Builder':
            return self

        def getOrCreate(self) -> 'SparkSession':
            return SparkSession()

    @staticmethod
    def builder() -> 'Builder':
        return SparkSession.Builder()

    def createDataFrame(self, data: List[tuple], schema: List[str]) -> DataFrame:
        """Create a DataFrame from data and schema."""
        dict_data = [dict(zip(schema, row)) for row in data]
        return DataFrame(dict_data, schema)

    def stop(self):
        """Stop the session (no-op)."""
        pass


# Global spark session for convenience
spark = SparkSession()
