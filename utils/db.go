package utils

import (
	"fmt"
	"log"

	"github.com/boltdb/bolt"
)

var db *bolt.DB

//LoadDB is a func
func LoadDB() {
	d, err := bolt.Open("data.db", 0600, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer d.Close()
	d.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte("Presentations"))
		if err != nil {
			return fmt.Errorf("create bucket: %s", err)
		}

		return nil
	})
	db = d
}

//SavePresentation is a func
func SavePresentation(fileid string, url string) error {
	if db == nil {
		fmt.Printf("error DB")
	}
	fmt.Printf("TRY SAVEEEEEEEE "+fileid, " "+url)
	db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("Presentations"))

		err := b.Put([]byte(fileid), []byte(url))
		if err != nil {
			log.Printf("\n\n %s \n\n", err)
			return err
		}
		return nil
	})
	db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("Presentations"))
		v := b.Get([]byte(fileid))
		fmt.Printf("The answer is: %s\n", v)
		return nil
	})
	return nil
}

//LoadPresentation is a func
func LoadPresentation(code string) string {
	db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("Presentations"))
		v := b.Get([]byte(code))
		fmt.Printf("The answer is: %s\n", v)
		return nil
	})
	return ""
}
