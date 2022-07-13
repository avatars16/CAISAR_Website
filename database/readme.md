# Overview

In this document you can find all tables in the CAISAR mysql database. Down below is an overview of the structure of this document

#### Overview

-   General information
    -   how to retrieve data from mysql table
    -   How to acces retrieved data
    -   Need functions to transform data
-   User table
    -   column data information
    -   description about each column
-   Committee table
    -   column data information
    -   description about each column

---

---

# General information:

### How to retrieve data from mysql table

The files in the database folder are setup in the following way. <em>./database/db_generic</em> handles the connection with the mysql server and handles the actual queries. <em>./database/db_interaction</em> has some need helper functions to insert,update,delete rows. Its best to use these helperfunctions to retrieve data.

### How to acces retrieved data

When the data has been retrieved from the table, it is saved in JSON format. This means the data can be acces the following ways: <em>table.column, table[column]</em>.

### Need functions to transform the data

Some types of data are not displayed properly in the UI. Here is a need overview with the some functions to help.

-   DATETIME
    -   to type "datetime-local" nothing is required
    -   to type "date" use function DATETIME.toISOString().split("T")[0]
    -   to type "time" use function .toISOString().split("T")[1]
    -   to plain date text use DATETIME.toLocaleDateString() (does not display time!)
    -   to plain time text use DATETIME.toLocaleTimeString() (does not display date!)
    -   to plain text (both date and time) use DATETIME.toLocaleString()

---

---

# User table:

In this table personal information is saved about each user. This includes contact details, login details, user permissions etc.

| column name    | value type          | required | unique | Key     |
| -------------- | ------------------- | -------- | ------ | ------- |
| userId         | int                 | yes      | yes    | primary |
| createdAt      | DATE                | yes      |
| birthDay       | DATE                | no       |
| firstName      | varchar(255)        | yes      |
| middleName     | varchar(255)        | no       |
| lastName       | varchar(255)        | yes      |
| email          | varchar(255)        | yes      | yes    |
| phone          | not implemented yet |
| userSlug       | varchar(255)        | yes      | yes    |
| lastLogin      | DATE                | yes      |
| numberOfLogins | int                 | yes      |
| profileViews   | int                 | yes      |
| private        | BOOL                | yes      |

---

### Description of each column, and what it is used for

-   **userId** Primary key. For security reasons never share this to the user. Look up users by userSlug or name. Only use userId for joining two tables.
-   **createdAt**
-   **birthDay**
-   **websiteRole** Role to determine the permissions of user on the website. Can be set to values found in file <em>permissions/data.js</em>
-   **firstName**
-   **middleName**
-   **lastName**
-   **email** Has to be a unique value. Otherwise users can log into each other accounts
-   **phone**
-   **userSlug** Has to be a unique value.

Fun statistic values, do not show to users

-   **userId**
-   **lastLogin**
-   **numberOfLogins**
-   **profileViews**
-   **private**

---

---

# Committee database

In this table memberships of committees/batches <em>(lichtingen)</em>/board is stored.

As of now the workings of this table is a bit complicated. Rows with the column committeeRole empty are rows in which data about the committee itself is stored (eg. name, when its started). Rows with the committeeRole and the userId not empty are used to store information about the member of that committee(eg. period of the membership, role).

In the future this can be changed to two tables, so accessing the committee information is easier. We could store more information about the committee as well (such as photo, description). Could also store this information in a general pages table, but this could become a giant mess

| column name     | value type   | required | unique | Key             |
| --------------- | ------------ | -------- | ------ | --------------- |
| committeeId     | int          | yes      | yes    | Primary         |
| userId          | int          | no       | yes    | Foreign (users) |
| memberRole      | varchar(255) | no       |
| startDate       | DATE         | yes      |
| endDate         | DATE         | no       |
| committeeName   | varchar(255) | yes      | no\*   |
| committeeURL    | varchar(255) | yes      | no\*   |
| committeeParent | varchar(255) | no       |
| committeeType   | varchar(255) | yes      |

\* According for the database the values are not unique. This is because the committee itself as well as all its members have this same(!!) value.

---

### Description of each column, and what it is used for

-   **committeeId** Primary key. Do not share with end user
-   **userId** Foreign key to link the member with personal infomartion in <em>users</em> table. Do not share with end user
-   **memberRole** Used for permissions for for example the chair of the committee. Can be set to values found in file <em>permissions/data.js</em>
-   **startDate** User is member since, committee started at date..
-   **endDate** Null means user is still member/ committee is still activate.
-   **committeeName**
-   **committeeURL** Used in URL and to look up committees.
-   **committeeParent** Can be used for sub committees.
-   **committeeType** To distinguish between committees and batches<em>(lichtingen)</em>
