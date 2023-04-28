# Defects

Here we inserted some defects that we have found while working on the project.

## Consistency

-   A transaction can be inserted for a category that does not exist
    
-   In CreateCategory, there is no check in order to avoid duplicates
    

## Security

-   An admin should be implemented, here a possible reason:
    

-   GetUser can be called by everyone without any authorization, it should be a restricted operation
    

## Design

-   The GetLabels method does not retrieve the date of the transaction
    

  

## Test

-   No unit tests are implemented, just API test