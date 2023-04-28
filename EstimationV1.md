# Project Estimation - CURRENT
Date: 28/04/2023

Version: 1.0


# Estimation approach
Consider the EZWallet  project in CURRENT version (as received by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course
# Estimate by size

<!---
    user: 165 LOC -> 473 LOC w/test
        - auth.js = (15 + 49 + 37 + 18) LOC = 119 LOC
        - users.js = 26 LOC
        - User.js = 20 LOC
        test:
            - auth.test.js = 240 LOC
            - users.test.js = 68 LOC
    
    category: 31 LOC -> 80 LOC w/test
        - controller.js = (10 + 10) LOC = 20 LOC
        - model.js = 11 LOC
        test:
            - controller.test.js = 49 LOC
    
    transaction: 64 LOC -> 193 LOC w/test
        - controller.js = (10 + 7 + 8 + 22) LOC = 47 LOC
        - model.js = 17 LOC
        test:
            - controller.test.js = 129 LOC
    
    TOT: 260 -> 746 w/test        AVG: 86.7 -> 248.7 w/test


    calendar weeks in this case: 160ph x week
--->

### 
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed   |             3               |             
| A = Estimated average size per class, in LOC       |             87                | 
| S = Estimated size of project, in LOC (= NC * A) | 260 |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |               26                       |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) | 780 | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |       0.162             |               

# Estimate by product decomposition

### 
|         Component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| requirement document    | 30 |
| GUI prototype | 12 |
| design document | 30 |
| code | 26 |
| unit tests | 40 |
| api tests | 49 |
| management documents  | 4 |



# Estimate by activity decomposition

We assume a team of four developer, 8 hours per day, five days per week, in order to be consistent with the previous assumption. 
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- |
| **Project estimation** |  |
| Estimation document | 16 |
| **Requirement document** | |
| Requirement planing | 12 |
| Analysis of stakeholders | 4 |
| Context Diagram & interfaces | 4 |
| Definition of project Requirements | 18 |
| --*Functional Requiements* | 10 |
| --*Non-Functional Requirements* | 8 |
| Use Cases Diagram | 8 |
| Glossary | 4 |
| System Design | 4 |
| Deployment Design | 4 |
| **GUI Prototype** | 12 |
| **Design** | |
| Design Document | 30 |
| **Development** | |
| Models | 4 |
| Controllers | 22 |    
| Test | 89 |

# Gantt


![gantt_chart](images\V1\gantt_chart.png)

# Summary

Report here the results of the three estimation approaches. While the estimate by size is considering just the size and effort related to the code associated with the classes, estimate by product decomposition and estimate by activity decompositon have a global view of the project, taking in consideration also the documents. 

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size | 26 ph | 0.162 weeks |
| estimate by product decomposition | 191 ph | 1.194 weeks |
| estimate by activity decomposition | 232 ph | 1.444 weeks |