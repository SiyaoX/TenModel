package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	for i := 0; i < 20; i++ {
		p()
	}
}

func p() {
	rand.Seed(time.Now().UnixNano()) // Seed the random number generator once

	var questions [][]int

	// Generate and write math problems to the file
	for i := 0; i < 10; i++ {
		var num1, num2 int
		for {
			num1 = rand.Intn(99) + 1 // Exclude 0
			num2 = rand.Intn(99) + 1 // Exclude 0
			if num1 >= num2 && num1+num2 <= 100 {
				break
			}
		}

		questions = append(questions, []int{num1, num2})
	}

	for _, question := range questions {
		fmt.Printf("%4d\t", question[0])
	}

	fmt.Println()
	for _, question := range questions {
		fmt.Printf("+%3d\t", question[1])
	}
	fmt.Println()

	for i := 0; i < len(questions); i++ {
		fmt.Printf("%s\t", "----")
	}
	fmt.Println()
	fmt.Println()
}
