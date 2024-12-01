---
title: "DSA Interview Notes: String [Part 5]"
summary: "String: practice subsequences and parentheses question"
thumbnail: "/assets/thumbnails/dsa-part5-bg.png"
---

<!-- date: 2024-03-03T09:07:05+05:30
tags: ["dsa", "interviews"]-->

String is a sequence of characters, so essentially it is an array. Questions can be tricky so practice as much as possible. Following techniques cover intervier's favorite questions:

## Palindrome

A string is called palindrome when original word is equal to reversed word. Palindrome either could be odd or even length. The idea to apply is that expand equally from the middle of the string to check a palindrome. Here's a general template:
```cpp
bool checkPalindrome(strign s, int n) {
    int l = (n-1)/2;
    int r = n/2;
    while (l>=0 && r<n) {
        if (s[l--]!=s[r++]) return false;
    }
    return true;
}
```

Practice Problems:
- [Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/)

## Longest Common Subsequence

Subsequence is a collection of characters and those characters should be in the increasing order of indices. Many problems come down to this property.

Another really important concept is longest common subsequence (LCS). It have to be computed as a subproblem for some problems. Here's the implementation where `dp` is memoization matrix initialized as global variable:

```cpp
int lcs(string &s1, string &s2, int m, int n) {
    if (m==0 || n==0) return 0;
    if (dp[m][n]!=-1) return dp[m][n];

    if (s1[m-1]==s2[n-1]) return dp[m][n] = 1 + lcs(s1, s2, m-1, n-1);
    else return dp[m][n] = max(lcs(s1, s2, m-1, n), lcs(s1, s2, m, n-1));
}
```

Practice problems:
- [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence)
- [Longest Palindromic Subsequence](https://leetcode.com/problems/longest-palindromic-subsequence)
- [Edit Distance](https://leetcode.com/problems/edit-distance)

## Parentheses and Expressions

Questions asking about balancing parentheses or evaluating expressions is pretty common. The idea is to **think of the stack data structure** in such cases because usually it is required to use the last seen information. For example - in balanced parentheses if '(' is seen before then ')' can correspond to it and we can remove that pair.

For expression problems, trick is to create one stack for operands and another one for operators. Then, parse them such that lower priority cannot be evaluated before the higher priority i.e. '+' and '-', cannot come on top of '*' or '/' in the stack. See [Basic Calculator II](https://leetcode.com/problems/basic-calculator-ii/) for more clarity.

Practice problems:
- [Minimum Number of Swaps to Make the String Balanced](https://leetcode.com/problems/minimum-number-of-swaps-to-make-the-string-balanced)
- [Minimum Deletions to Make String Balanced](https://leetcode.com/problems/minimum-deletions-to-make-string-balanced)
- [Remove duplicate letters](https://leetcode.com/problems/remove-duplicate-letters)
- [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation)
- [Decode String](https://leetcode.com/problems/decode-string/)
