---
title: "DSA Interview Notes: Stack & Queue [Part 6]"
summary: "Know when to make monotonic increasing/decreasing data structures"
thumbnail: "/assets/thumbnails/dsa-part6-bg.png"
archived: true
---

<!-- date: 2024-03-09T09:19:14+05:30
tags: ["dsa", "interviews"]-->

It is a data structure which follows the property of LIFO (last in First Out)

- `top()` or `peek()` --> It returns you the top element from the stack in O(1) time complexity
- `pop()` --> It deletes the top element from the stack in O(1) time complexity
- `push()` --> It adds an element to the top of the stack in O(1) time complexity
- `size()` --> It returns you the number of elements present in the stack
- `empty()` --> It returns true if the stack is empty, otherwise false

Consider below intuitive points for solving problems:
- During an interview Whenever you feel that you need to traverse backward as compared to current index location, in that case rather than nested loop (to go backward), think of the stack as a possible solution.
- Whenever you add an element in the stack, that element could be index, element, or in case of string it could be character.
- Stack may be used to reverse the string


Let's solve [Next Greater Element II](https://leetcode.com/problems/next-greater-element-ii/) to understand how we can make a monotonic increasing stack and use it in various situations.

```cpp
class Solution {
public:
    vector<int> nextGreaterElements(vector<int>& nums) {
        int n = nums.size();
        vector<int> visited(n, false);
        vector<int> ans(n, -1);
        stack<int> st;
        for (int i=0; i<2*n; ++i) {
            while (!st.empty() && nums[st.top()] < nums[i%n]) {
                int prev = st.top(); st.pop();
                visited[prev]=true;
                ans[prev] = nums[i%n];
            }
            st.push(i%n);
        }
        return ans;
    }
};
```

You may encounter situations where you need to find next lexicographically greater permutation of the sequence, and you might use stack there. But it can be solved in O(1) and the idea is quite logical:
1. Traverse from right to left and find the element which does not follow ascending order.
2. Switch the position of that element with greater element on the right side.
3. Reverse the right portion of the sequence. As its already sorted in decreasing order, after reversing it will be ascending sorted.

_Note: Sequence sorted in descending order does not have any next greater permuation._

**Practice problems:**
- [Next Greater Element I](https://leetcode.com/problems/next-greater-element-i/)
- [Next Greater Element IV](https://leetcode.com/problems/next-greater-element-iv)
- [Steps to Make Array Non-decreasing](https://leetcode.com/problems/steps-to-make-array-non-decreasing/)
- [Sum of Total Strength of Wizards](https://leetcode.com/problems/sum-of-total-strength-of-wizards)
- [Car Fleet II](https://leetcode.com/problems/car-fleet-ii)


## Queue

It is a data structure which follows the logic of FIFO (First In First Out) that implies the element which has been inserted first into the queue will be the first element to get deleted from queue. It is generally implemented either using array or linkedlist.


Let's see one of the most boring and popular question: [Implement queue using stack](https://leetcode.com/problems/implement-queue-using-stacks). The below idea uses auxiliary stack:
1. Keep one stack S1 for push operations and another stack S2 for pop operations.
2. Whenever there is a push operation, first transfer all elements from S2 to S1 if any and then push element on top of S1
3. Whenever there is a pop operation, first transfer all elements from S1 to S2 if any and then pop the top element from S2.


**Deque (Doubly ended queue)**: Deque is simply a doubly linked list that have pointers at both sides to implement following operations:

- `push_front()`and `push_back()` --> These functions are used to push elements into a deque from the front and back respectively in O(1) time complexity
- `pop_front()` and `pop_back()` --> These functions are used to delete elements from the front and back respectively in O(1) time complexity
- `front()` and `back()` --> Refer to the first and last element respectively of the deque container.

It is very hepful in finding [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum) which is important concept for many problems. Let's look at its implementation:
```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        int n = nums.size();

        // monotonic decreasing deque
        deque<int> q;
        vector<int> ans;
        for (int i=0; i<n; ++i) {
            // remove out of range elements from the front
            while (!q.empty() && i-q.front()+1>k) q.pop_front();

            // remove smaller elements from the back
            while (!q.empty() && nums[q.back()] < nums[i]) q.pop_back();

            // add element to the queue
            q.push_back(i);

            // update ans
            if (i>=k-1) ans.push_back(nums[q.front()]);
        }
        return ans;
    }
};
```

Practice problems:
- [Reveal Cards In Increasing Order](https://leetcode.com/problems/reveal-cards-in-increasing-order/)
- [Design Front Middle Back Queue](https://leetcode.com/problems/design-front-middle-back-queue)
- [Reveal Cards In Increasing Order](https://leetcode.com/problems/reveal-cards-in-increasing-order/)
