## Regenerate schema
If you made edits to the gql schema.gql

```
go run github.com/99designs/gqlgen generate .
```

## Start DB
Open neo4j desktop 
Click on proto-server, run

## Run server

```
go run server.go
```


### Cypher cheatsheet
Test data
```
create (a:Node {id: "123", x: 100.0, y: 100.0, text: "hello" }),
        (b:Node {id: "234", x: 200.0, y: 200.0, text: "hello" })
MATCH (a:Node {id: '123'}), (b:Node {id: '234'})
CREATE (a)-[:LINKED]->(b)
```