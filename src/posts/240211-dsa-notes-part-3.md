---
title: "DSA Interview Notes: Binary Tree [Part 3]"
summary: "Binary Tree: Master BFS and DFS"
thumbnail: "/assets/thumbnails/dsa-part3-bg.png"
---

<!-- date: 2024-02-11T20:01:57+05:30
tags: ["dsa", "interviews"]-->

Binary tree is a data structure in which each node has at most two children i.e. left and right child.

All the questions related to the binary tree can be solved using the two techniques below:
1. BFS (Breadth-first search)
2. DFS (Depth-first search)

## Breadth-first search
Breadth first search is same as level-order traversal for the binary tree. Read more [here](https://cp-algorithms.com/graph/breadth-first-search.html).

General template:
```cpp
queue<TreeNode*> q;
q.push(root); // add root of the binary tree to the queue

while (!q.empty()) {
    // denotes number of nodes in current level
    int sz = q.size();

    // loop through the complete level
    for (int i=0; i<sz; ++i) {
        // extract the first element from the queue
        TreeNode* peek = q.front(); q.pop();

        if (peek->left) q.push(peek->left);
        if (peek->right) q.push(peek->right);
    }
}
```

### Example
Problem link - [ZigZag Order](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal). Given the root of a binary tree, return the zigzag level order traversal of its nodes' values. (i.e., from left to right, then right to left for the next level and alternate between).

```cpp
class Solution {
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if (!root) return ans;

        queue<TreeNode*> q;
        q.push(root);

        int level = 0;        
        while (!q.empty()) {
            int sz = q.size();

            vector<int> curr;
            for (int i=0; i<sz; ++i) {
                TreeNode* peek = q.front(); q.pop();
                curr.push_back(peek->val);

                if (peek->left) q.push(peek->left);
                if (peek->right) q.push(peek->right);
            }
            if (level%2==1) reverse(curr.begin(), curr.end());
            ans.push_back(curr);
            level++; 
        }
        return ans;
    }
};
```

### Practice problems
- [Right view](https://leetcode.com/problems/binary-tree-right-side-view)
- [Find bottom left tree value](https://leetcode.com/problems/find-bottom-left-tree-value)


## Depth-first search
Depth-first search problems is generally easier to think and implement in a recursive manner. Read more about it [here](https://cp-algorithms.com/graph/depth-first-search.html). Keep following points in mind for recursion:
1. Identify the parameters which will help you in solving the problem.
2. Think of the base condition
3. Think of how you will make a recursive call to the function by calling the smaller instances of it so that it could reach the base condition.
4. Think of the value you need to return back to its parent function call which would help you to solve the problem.


General template:
```cpp
void preOrderTraversal(TreeNode* root) {
    // Base condition
    if (!root) return;

    // Compute and recurse according to the problem
    cout << root->val << " ";
    traverse(root->left);
    traverse(root->right);
}

void solve(TreeNode* root) {
    preOrderTraversal()
}
```

### Example

Problem link - [Mirror Tree](https://leetcode.com/problems/symmetric-tree). Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).

```cpp
class Solution {
public:
    bool helper(TreeNode* root1, TreeNode* root2) {
        if (!root1 && !root2) return true;
        if (!root1 || !root2) return false;

        return (root1->val==root2->val && helper(root1->left, root2->right) && helper(root1->right, root2->left));
    }
    bool isSymmetric(TreeNode* root) {
        return helper(root->left, root->right);
    }
};
```

### Tips and Tricks
1. **Traversal Order**

    There are three types of traversal order defined (V=Value, L=Left, R=Right) which tells when to process the root value. Following are:
    - PreOrder: V L R
    - InOrder: L V R
    - PostOrder: L R V

    Popular question: [Construct a binary tree from preorder and inorder traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal)
        
    ```cpp
    class Solution {
    public:
        int preindex = 0;
        TreeNode* traverse(vector<int>& preorder, int s, int e, unordered_map<int,int> &mp) {
            if (s > e) return NULL;
            
            TreeNode* root = new TreeNode(preorder[preindex++]);

            int inOrderIndex = mp[root->val];
            root->left = traverse(preorder, s, inOrderIndex-1, mp);
            root->right = traverse(preorder, inOrderIndex+1, e, mp);

            return root;
        }
        TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
            int n = preorder.size();
            unordered_map<int,int> mp;
            for (int i=0; i<n; ++i) mp[inorder[i]] = i;
            return traverse(preorder, 0, n-1, mp);
        }
    };
    ```
    
    Now, try solving this problem by yourself: [Construct a binary tree from postorder and inorder traversal](https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal)

2. **Lowest Common Ancestor (LCA)**

    According to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).”

    It is important to understand the concept of LCA as it may be used as a subproblem for other problems. Here is its implementation (test on leetcode [here](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree)):

    *Note that the below implementation assumes both the given nodes exist*
    ```cpp
    class Solution {
    public:
        TreeNode* getLCA(TreeNode* root, TreeNode* p, TreeNode* q) {
            // not found base condition
            if (!root) return NULL;

            // return root itself to indicate presence of the value
            if (root->val == p->val || root->val == q->val) return root;

            // traverse left and right if not found yet
            TreeNode* left = getLCA(root->left, p, q);
            TreeNode* right = getLCA(root->right, p, q);

            // current node is lowest common ancestor
            if (left && right) return root;

            // otherwise return the path where some value is found
            return (left ? left : right);
        }
        TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
            return getLCA(root, p, q);
        }
    };
    ```

    Now, try solving this problem by yourself: [LCA of deepest levels](https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/)

### Practice problems
- [Sum Root to Leaf Numbers](https://leetcode.com/problems/sum-root-to-leaf-numbers)
- [Insufficient Nodes in Root to Leaf Paths](https://leetcode.com/problems/insufficient-nodes-in-root-to-leaf-paths)
- [Path Sum](https://leetcode.com/problems/path-sum/)
- [Path Sum II](https://leetcode.com/problems/path-sum-ii)
- [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum)
