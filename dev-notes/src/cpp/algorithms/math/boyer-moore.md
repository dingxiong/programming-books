# Boyer-Moore Voting Algorithm

Suppose you have an array and it has a majority element, i.e., an item that
shows up more than n/2 times in the array. Here `n` is the size of the array.
How could you find this majority element using linear time and constant space?

Boyer-Moore algorithm is a smart way to solve this problem. The core insight is
if you pair up each occurrence of the majority element with a different element
and cancel them out, the majority element will still have unpaired occurrences
left over because it appears more than half the time. See the pseudocode below.

```
candidate = null
count = 0

for each element in array:
    if count == 0:
        candidate = element
        count = 1
    else if element == candidate:
        count++
    else:
        count--
```

See below example. The vertical bar is the place `count` becomes zero, and we
need select a new candidate.

```
[7, 7, 5, 7, 5, 1 | 5, 7 | 5, 5, 7, 7 | 7, 7, 7, 7]
```

It is easy to prove it mathematically. Suppose `n` is the array size, and the
majority element has count `c > n/2`. The first `2m` elements cancel out. There
are two cases.

- The current candidate is the majority element, so `m` majority elements are
  cancelled. In the rest array of length `n-2m` we have `c-m` majority element.
  But still `c-m > (n-2m)/2`. It is still the majority element in the remaining
  array.

- The current candidate is not the majority element. Then out of the cancelled
  `2m` items, less or equal `m` elements are the true majority element. This is
  more favorable compared to case 1.

This match formula may go against intuition. You may think that there may be a
"close-to-majority" item in the array. For example, if majority item count is
6, and this "close-to-majority" has count 4 whatever. Then in the cancelled
`2m` items, `m` items are the majority item, but the rest `m` items are not the
"close-to-majority" items. Then after cancelling, shouldn't the
"close-to-majority" item become majority in the rest of the array?
