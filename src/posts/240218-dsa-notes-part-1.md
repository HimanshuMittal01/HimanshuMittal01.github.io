---
title: "DSA Interview Notes: Array [Part 1]"
summary: "Array: Sounds simple, yet involve variety of tricks"
thumbnail: "/assets/thumbnails/dsa-part1-bg.png"
---

<!-- date: 2024-02-18
tags: ["dsa", "interviews"]
 -->

Array is a fundamental data structure which is used to store elements of same data type. In an array, elements are stored in contiguous memory location.

Time complexity of best algorithm to sort the array is `O(nlogn)`

Index plays a very important role in problems related to array. Depending on the problem, you need to use additional variables which will act as an index in your input array.

## Two pointer approach
It is a technique used for efficiently solving problems related to arrays and linked lists. The basic idea is to use two pointers that traverses the array or list in a way that will help identify a solution, subarray or some property of data efficiently.

**When can you apply it?**<br />
There needs to be a certain relation in the input and the output which is required.

Some common scenarios where you can apply two-pointer approach is:
| No | Problem                                                                                                       | Description                                  | Approach                                                                                                                                                   |
|----|---------------------------------------------------------------------------------------------------------------|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | [ Two sum ]( https://leetcode.com/problems/two-sum )                                                          | Finding a pair in sorted array               | Create left and right pointers initialized to 0 and n-1. Move left+1 if target is higher and right-1 otherwise. Terminate the loop if the answer is found. |
| 2  | [ Remove duplicates from sorted array ]( https://leetcode.com/problems/remove-duplicates-from-sorted-array/ ) | Remove duplicates in-place and return length | Keep one pointer to track the index that denotes length of unique elements and other one to iterate all values.                                            |
| 3  | [ Move Zeroes ]( https://leetcode.com/problems/move-zeroes )                                                  | Move all zeroes to the end                   | Keep one pointer to track the index of non-negative integer and other one to iterate all values.                                                           |

TODO: Add 'merge sorted arrays' and 'pivot' approach here
TODO: Add 'prefix and suffix' and 'trapping rainwater' technique / [Bag of Tokens](https://leetcode.com/problems/bag-of-tokens)

## Subarray problems

A subarray is a subset of an array where all elements in the subarray needs to be contiguous. We can broadly categorize the techniques into three categories:

1. **Hashmap**

    The idea is to use hashmap to store a property of the subarray like index, sum, product, etc. depending on the problem and then perform compuation based on that property to identify the required subarray.

    General pattern of code:
    ```cpp
    // Question is to find number of subarrays which have sum equal to target
    // https://www.geeksforgeeks.org/number-subarrays-sum-exactly-equal-k/

    int findSubarraySum(vector<int> &arr, int target) {
        // store sum as key and freq of sum as value
        unordered_map<int,int> mp;

        int ans = 0;
        int curr = 0;
        for (int i=0; i<arr.size(); ++i) {
            // add element to track curr sum so far
            curr += arr[i];

            // found the target; subarray from index [0,i]
            if (curr==target) ans++;

            // find (curr-target) in hashmap
            // If found that means subarray with sum target exists
            // where end element is 'i' and no of possible starts are
            // recorded in hashmap
            if (mp.find(curr-target) != mp.end()) {
                ans += mp[curr-target];
            }

            // update freq
            mp[curr]++;
        }
        return ans;
    }
    ```
    
    Practice problems:
    - [Longest Subarray Sum K](https://www.geeksforgeeks.org/longest-sub-array-sum-k/)
    - [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k)
    - [Continuous Subarray Sum](https://leetcode.com/problems/continuous-subarray-sum)
    - [Largest Subarray with Equal Number of 0s and 1s](https://www.geeksforgeeks.org/largest-subarray-with-equal-number-of-0s-and-1s/)
    - [Longest Subarray with Equal Number of Odds and Evens](https://www.geeksforgeeks.org/length-of-longest-subarray-with-equal-number-of-odd-and-even-elements/)

2. Sliding Window

    The idea is similar to two-pointers approach i.e. to track start and end of the subarray however it is so common in the subarray problems that it deserves its own category.

    Usually you have to keep track of the start of the subarray. Other than that there are no general templates for it. More you practice, better it is. Try these different variety of problems:
    
    - [Maximum Ascending Subarray Sum](https://leetcode.com/problems/maximum-ascending-subarray-sum)
    - [Longest Nice Subarray](https://leetcode.com/problems/longest-nice-subarray)
    - [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum)
    - [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters)

3. Kadane's Algorithm

    [Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray) and [Maximum Sum Subarray](https://leetcode.com/problems/maximum-subarray) are two very important problems to understand for solving greedy/DP problems.


## Binary search


## Classic problems

**Stock** related problems is a popular category for interview questions. The idea simply is to maximize profit given some rules defined in the question. Just attempt the first two problems of the following series on the leetcode (attempt others if you know about DP approach):
1. [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock)
2. [Best Time to Buy and Sell Stock II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii)
3. [Best Time to Buy and Sell Stock III](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii)
4. [Best Time to Buy and Sell Stock IV](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv)
5. [Best Time to Buy and Sell Stock with Cooldown](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown)
6. [Best Time to Buy and Sell Stock with Transaction Fee](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee)

**Meeting room** related problems is often asked in interview questions. The idea here is to sort the periods based on start time and then start clubbing periods by comparing end of previous group and start of current period.
