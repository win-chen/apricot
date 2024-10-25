package neo4jdb

import (
	"context"
	"fmt"
	"os"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func Connect(ctx context.Context) (neo4j.DriverWithContext, error) {
	// Access environment variables
	dbUri, exists := os.LookupEnv("NEO4J_URI")
	if !exists {
		return nil, fmt.Errorf("NEO4J_URI not set in .env")
	}

	dbUser, exists := os.LookupEnv("NEO4J_USERNAME")
	if !exists {
		return nil, fmt.Errorf("NEO4J_USERNAME not set in .env")
	}

	dbPassword, exists := os.LookupEnv("NEO4J_PASSWORD")
	if !exists {
		return nil, fmt.Errorf("NEO4J_USERNAME not set in .env")
	}

	// Create driver
	driver, err := neo4j.NewDriverWithContext(
		dbUri,
		neo4j.BasicAuth(dbUser, dbPassword, ""))
	if err != nil {
		return nil, fmt.Errorf("failed to create Neo4j driver: %w", err)
	}

	// Verify connection
	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to verify Neo4j connection: %w", err)
	}

	return driver, nil
}
