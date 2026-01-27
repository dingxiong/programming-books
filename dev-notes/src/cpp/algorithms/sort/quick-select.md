# Quick Select

```cpp
/*
 * Average complexity O(N), worse complexity O(N^2).
 * C++ has std::nth_element()
 *
 */
void select(vector<int> &nums, int start, int end, int k) {
  if (start == end)
    return;
  int p = partition(nums, start, end, start);
  if (p == k) return;
  else if (p > k)
    select(nums, start, p - 1, k);
  else if (p < k)
    select(nums, p + 1, end, k); // note. it is still `k`, not something like k-p.
}

/**
 * group a list into two parts: those less than a certain element, and those
 * greater than or equal to the element.
 *
 * Return: the index of the first element that is equal to the pivot element.
 */
int partition(vector<int> &nums, int start, int end, int pivot) {
  int pV = nums[pivot];
  int smallIndex = start;
  swap(nums[end], nums[pivot]);
  for (int i = start; i < end; i++) {
    if (nums[i] < pV) swap(nums[i], nums[smallIndex++]);
  }
  swap(nums[end], nums[smallIndex]);
  return smallIndex;
}
```
