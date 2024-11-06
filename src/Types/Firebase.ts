import { FirebaseApp } from "firebase/app";
import { Database } from "firebase/database";

export interface FirebaseType{
  database: Database;
  firebaseApp: FirebaseApp
}