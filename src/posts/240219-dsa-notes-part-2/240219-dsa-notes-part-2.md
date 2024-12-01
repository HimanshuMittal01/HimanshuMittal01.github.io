---
title: "DSA Interview Notes: Linked List [Part 2]"
summary: "Linked List: It's all about pointer manipulation"
thumbnail: "/assets/thumbnails/dsa-part2-bg.png"
---

<!-- date: 2024-02-19T21:53:23+05:30
tags: ["dsa", "interviews"] -->

Linked List is a linear data structure in which elements are stored in nodes and each of the node contains the data and address or link or reference to the next node in the sequence.

In linked list related problems, most of the questions will revolve around manipulation of pointers.

1. **Reversing a linked list** is sometimes required to solve the task. Here's how you can do it:
    ```cpp
    ListNode* reverseList(ListNode* head) {
        if (!head || !head->next) return head;

        ListNode* curr = head;
        ListNode* prev = nullptr;
        while (curr) {
            ListNode* next = curr->next;

            // note this pattern
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
    ```

    Practice problems:
    - [Reverse Linked List II](https://leetcode.com/problems/reverse-linked-list-ii)
    - [Reverse Nodes in K group](https://leetcode.com/problems/reverse-nodes-in-k-group/)
    - [Add Two Numbers II](https://leetcode.com/problems/add-two-numbers-ii)

2. **Fast and slow pointer** approach is another idea which can be seen in the interview questions. Illustrating how to [find middle point](https://leetcode.com/problems/middle-of-the-linked-list) using it  :
    ```cpp
    ListNode* middleNode(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }
    ```

    This concept can be applied to solve [Detect and Find Cycle](https://leetcode.com/problems/linked-list-cycle-ii) in a linked list. Additionally, you need to know an important trick i.e. **when cycle exists, slow and fast pointer merge** after some iterations.
    
    <img src="./linked list cycle detection.png" alt="Linked list cycle detection process">

    And to find the node from which the cycle starts, use the following technique. Let's say distance from head of linked list to start of the cycle is `x`, distance from start of the cycle to merge point is `y`, and distance travelled from merge point to start of the cycle is `z`.
    
    $$ 2 (x+y) = x+y+y+z $$
    $$ x = z $$

    It means that **travelling equal distance from head and merge point, it meets at the start of the cycle.** So, simply put one pointer at head and other at merge point, and iterate next pointers till both meets at desired point.

*Tip: Creating a new sentinel nodes and pointing it to head is a useful trick to avoid edge cases.*

[Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer) is a tricky but an important problem to understand. Essentially, we have to deepcopy a linked list where each nodes is having next and random pointer. The intuitive approach is to first create new nodes by iterating through the next pointers and store the old to new node mapping in a hashmap, and then replicate random pointers using that hashmap. But there exists a beautiful O(1) space complexity solution. Let's see the implementation:
```cpp
Node* copyRandomList(Node* head) {
        // This can be broken down into three parts
        // 1. Create new nodes such that the new node follows its corresponding old node
        // 2. Add random pointer based on old nodes
        // 3. Restore original linked list and return copied head

        // Step 1
        // Before: 1 -> 2 -> 3 -> NULL
        // After: 1 -> 1' -> 2 -> 2' -> 3 -> 3' -> NULL
        Node* curr = head;
        while (curr) {
            Node* dup = new Node(curr->val);
            Node* nxt = curr->next;
            curr->next = dup;
            dup->next = nxt;
            curr = nxt;
        }

        // Step 2
        // newNode->random = (oldNode->random)->next
        // (oldNode->next)->random = (oldNode->random)->next
        curr = head;
        while (curr) {
            if (curr->random) {
                curr->next->random = curr->random->next;
            }
            curr = curr->next->next;
        }

        // Step 3 - Restore
        Node* sentinel = new Node(-1);
        sentinel->next = head;

        Node* newNode = sentinel;
        Node* oldNode = head;
        while (oldNode) {
            Node* nextNewNode = oldNode->next;
            Node* nextOldNode = oldNode->next->next;
            
            newNode->next = nextNewNode;
            oldNode->next = nextOldNode;

            newNode = nextNewNode;
            oldNode = nextOldNode;
        }
        return sentinel->next;
    }
```

Practice problems:
- [Remove Duplicates from Sorted List](https://leetcode.com/problems/remove-duplicates-from-sorted-list)
- [Remove Duplicates from Sorted List II](https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii)
- [Split Linked List in Parts](https://leetcode.com/problems/split-linked-list-in-parts)
- [Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list)
- [Delete the Middle Node of a Linked List](https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list)
- [Rotate List](https://leetcode.com/problems/rotate-list)
