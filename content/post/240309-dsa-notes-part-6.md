---
title: "DSA Interview Notes: Stack [Part 6]"
date: 2024-03-09T09:19:14+05:30
draft: true
---

It is a data structure which follows the property of LIFO (last in First Out)

- top() / peek() --> It returns you the top element from the stack in O(1) time complexity
- pop() --> It deletes the top element from the stack in O(1) time complexity
- push() --> It adds an element to the top of the stack in O(1) time complexity
- size() --> It returns you the number of elements present in the stack
- empty() --> It returns true if the stack is empty, otherwise false

Consider below intuitive points for solving problems:
- During an interview Whenever you feel that you need to traverse backward as compared to current index location, in that case rather than nested loop (to go backward), think of the stack as a possible solution.
- Whenever you add an element in the stack, that element could be index, element, or in case of string it could be character.
- Stack may be used to reverse the string


Let's solve few questions:
- [Decode String](https://leetcode.com/problems/decode-string/)

    ```cpp
    class Solution {
    public:
        string decodeString(string s) {
            stack<int> nums;
            stack<string> words;
            int i = 0;
            int n = s.length();
            while (i < n) {
                if (isdigit(s[i])) {
                    int num = 0;
                    while (i<n && isdigit(s[i])) {
                        num = num*10 + (s[i++] - '0');
                    }
                    nums.push(num);
                } else if (s[i]==']') {
                    // decode
                    string tmp;
                    while (!words.empty() && words.top()!="[") {tmp += words.top(); words.pop();}
                    if (words.top()=="[") words.pop();

                    int num = nums.top(); nums.pop();
                    string res;
                    while (num--) res+=tmp;
                    words.push(res);
                    i++;
                } else {
                    words.push(string{s[i++]});
                }
            }
            string ans = "";
            while (!words.empty()) {ans+=words.top(); words.pop();}
            reverse(ans.begin(), ans.end());
            return ans;
        }
    };
    ```

- [Next Greater Element II](https://leetcode.com/problems/next-greater-element-ii/)

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
