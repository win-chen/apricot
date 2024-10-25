package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"proto-server/gql"
	"proto-server/gql/generated"
	"proto-server/neo4jdb"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

const defaultPort = "8080"

func main() {
	ctx := context.Background()

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Connect to neo4jdb
	driver, err := neo4jdb.Connect(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to Neo4j: %v", err)
	}
	defer driver.Close(ctx)

	// Initialize resolver with the Neo4j driver
	resolver := &gql.Resolver{
		Driver: driver,
	}

	// Create GraphQL server
	srv := handler.NewDefaultServer(
		generated.NewExecutableSchema(
			generated.Config{Resolvers: resolver}))
	corsWrapper := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
	})

	// Set up HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	http.Handle("/", playground.Handler("Proto", "/query"))
	http.Handle("/query", corsWrapper.Handler(srv))
	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
