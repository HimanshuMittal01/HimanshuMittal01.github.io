---
title: "DSA Interview Notes: Matrix [Part 4]"
summary: "Matrix: Navigate grids extending concepts of traversal"
thumbnail: "/assets/thumbnails/dsa-part4-bg.png"
archived: true
---

<!-- date: 2024-02-24T20:05:50+05:30
tags: ["dsa", "interviews"]-->

Matrix is a two-dimensional array. Any problems related to matrix can be solved either via:
1. Auxiliary array or index manipulation, or
2. BFS / DFS

## Auxiliary array method

Standard loop. T.C. = `O(m*n)`
```cpp
// arr[m][n]
// m -> rows
// n -> cols
for (int i=0; i<m; ++i) {
    for (int j=0; j<n; ++j) {
        // do some operation here
    }
}
```

[Spiral Matrix](https://leetcode.com/problems/spiral-matrix/) problem is quite popular, still many fail to solve it properly because of the edge cases. Here's an intuitive solution:
```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int m=matrix.size(), n=matrix[0].size();

        int top=0, bottom=m-1;
        int left=0, right=n-1;
        vector<int> ans;
        while (left<=right && top<=bottom) {
            for (int j=left; j<=right; ++j) ans.push_back(matrix[top][j]);
            ++top;
            if (top > bottom) break;

            for (int i=top; i<=bottom; ++i) ans.push_back(matrix[i][right]);
            --right;
            if (left > right) break;

            for (int j=right; j>=left; --j) ans.push_back(matrix[bottom][j]);
            --bottom;
            if (top > bottom) break;

            for (int i=bottom; i>=top; --i) ans.push_back(matrix[i][left]);
            ++left;
        }
        return ans;
    }
};
```

[Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes) has a nice technique which leads to in-place solution. The idea is to use the first row and column as a placeholder. See below solution:
```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        // keep two variables to handle first row and col
        int m=matrix.size(), n=matrix[0].size();
        int setFirstRowZero = false;
        int setFirstColZero = false;
        for (int i=0; i<m; ++i) if (matrix[i][0]==0) {setFirstColZero = true; break;}
        for (int j=0; j<n; ++j) if (matrix[0][j]==0) {setFirstRowZero = true; break;}

        // set first row 0 to denote column will be 0
        // set first column 0 to denote row will be 0
        for (int i=1; i<m; ++i) {
            for (int j=1; j<n; ++j) {
                if (matrix[i][j]==0) {
                    matrix[0][j]=0;
                    matrix[i][0]=0;
                }
            }
        }

        // set full row and column 0 based on first row/col
        for (int i=1; i<m; ++i) {
            for (int j=1; j<n; ++j) {
                if (matrix[0][j]==0 || matrix[i][0]==0) matrix[i][j] = 0;
            }
        }

        // now check first row and col
        if (setFirstRowZero) for (int j=0; j<n; ++j) matrix[0][j] = 0;
        if (setFirstColZero) for (int i=0; i<m; ++i) matrix[i][0] = 0;
    }
};
```

[Maximal Square](https://leetcode.com/problems/maximal-square) is a beuatiful DP problem to apply this technique. You will also learn how to utilise property of a square in a matrix. The idea is that in order to find side of the square at point (i,j), we can do following because sequare needs to be equal both sides.

$$ S[i,j] = min(S[i-1,j], S[i,j-1], S[i-1,j-1]) + 1 $$

```cpp
class Solution {
public:
    int maximalSquare(vector<vector<char>>& matrix) {
        int m=matrix.size(), n=matrix[0].size();

        // initialise auxiliary side matrix
        vector<vector<int>> sides(m, vector<int>(n, 0));
        int ans = 0;
        for (int i=0; i<m; ++i) if (matrix[i][0]=='1') {sides[i][0]=1; ans=1;}
        for (int j=0; j<n; ++j) if (matrix[0][j]=='1') {sides[0][j]=1; ans=1;}

        // do side calculation
        for (int i=1; i<m; ++i) {
            for (int j=1; j<n; ++j) {
                if (matrix[i][j]=='1') {
                    sides[i][j] = min({sides[i-1][j], sides[i][j-1], sides[i-1][j-1]}) + 1;
                    ans = max(ans, sides[i][j]);
                }
            }
        }
        return ans*ans;
    }
};
```

**Practice problems:**
- [Transpose Matrix](https://leetcode.com/problems/transpose-matrix)
- [Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix)
- [Search a 2D Matrix II](https://leetcode.com/problems/search-a-2d-matrix-ii)
- [Spiral Matrix II](https://leetcode.com/problems/spiral-matrix-ii)
- [Spiral Matrix III](https://leetcode.com/problems/spiral-matrix-iii)
- [Spiral Matrix IV](https://leetcode.com/problems/spiral-matrix-iv)
- [Maximal Rectangle](https://leetcode.com/problems/maximal-rectangle)

**Tip:**
*It's crucial to consider that prioritizing reduced time complexity (T.C.) by employing additional space complexity (S.C.) is often a superior approach. Opting for lower T.C. at the expense of higher S.C. is generally favored over maintaining higher T.C. with constant S.C. When faced with challenges in minimizing T.C. during an interview, it's advisable to reconsider whether introducing extra space complexity can contribute to a more efficient solution.*


## BFS / DFS method

Matrix can be treated as an unweighted graph. Unweighted graph is a graph where the distance from one node to another node always remains the same.

Whenever in an interview, you are asked to find out the shortest path from source to the destination in a matrix, generally BFS will be used to solve the problem.

The **general implementation** of traveral in matrix is as follows:
```cpp
// Create dx and dy helper arrays
// to traverse possible nodes from a cell
// if only top, left, right and bottom required
// reduce its length to 4 accordingly
int dx[8] = {-1,-1,0,1,1,1,0,-1};
int dy[8] = {0,1,1,1,0,-1,-1,-1};

// Initialize queue and visited array
// Initially distance of source node to itself is zero
int m=grid.size(), n=grid[0].size();
vector<vector<bool>> visited(m, vector<bool>(n, false));
queue<pair<int,int>> q;
q.push({0,0});
visited[0][0] = true;
int dist = 0;

// BFS
while (!q.empty()) {
    // Increase size as we traverse its children
    int sz = q.size();
    dist++;

    while (sz--) {
        // current cell
        pair<int,int> curr = q.front(); q.pop();
        int x=curr.first, y=curr.second;

        // target condition meet
        // here now checking whether it reaches bottom right
        if (x==m-1 && y==n-1) return dist;

        // traverse neighbors
        for (int k=0; k<8; ++k) {
            int nx = x+dx[k];
            int ny = y+dy[k];

            // check allowable condition
            // here another check applied is cell value must be 0
            if (nx>=0 && nx<m && ny>=0 && ny<n && !visited[nx][ny] && grid[nx][ny]==0) {
                visited[nx][ny] = true;
                q.push({nx,ny});
            }
        }
    }
}
return -1;
```

Practice problems:
- [Shortest Path in Binary Matrix](https://leetcode.com/problems/shortest-path-in-binary-matrix)
- [Longest Increasing Path in a Matrix](https://leetcode.com/problems/longest-increasing-path-in-a-matrix)
- [Max Area of Island](https://leetcode.com/problems/max-area-of-island)
