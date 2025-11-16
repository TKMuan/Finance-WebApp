CREATE TABLE IF NOT EXISTS "document" (
	"created" TIMESTAMP NOT NULL,
	"modified" TIMESTAMP NOT NULL,
	"modified_by" CHAR(65) NOT NULL
);




CREATE TABLE IF NOT EXISTS "transactions" (
	"id" CHAR(65) NOT NULL UNIQUE,
	"description" TEXT,
	"transaction_time" TIMESTAMP NOT NULL,
	"accountID" CHAR(65) NOT NULL,
	"amount" MONEY NOT NULL,
	"type" BOOLEAN NOT NULL,
	PRIMARY KEY("id")
) INHERITS ("document");




CREATE TABLE IF NOT EXISTS "account" (
	"id" CHAR(65) NOT NULL UNIQUE,
	"email" CHAR(50) NOT NULL,
	"password" CHAR(65) NOT NULL,
	"fname" CHAR(50) NOT NULL,
	"lname" CHAR(50) NOT NULL,
	"mname" CHAR(50),
	PRIMARY KEY("id")
) INHERITS ("document");




CREATE TABLE IF NOT EXISTS "user_info" (
	"id" CHAR(65) NOT NULL UNIQUE,
	"fname" CHAR(50) NOT NULL,
	"lname" CHAR(50) NOT NULL,
	"mname" CHAR(50),
	PRIMARY KEY("id")
) INHERITS ("document");




CREATE TABLE IF NOT EXISTS "userGroupings" (
	"id" CHAR(65) NOT NULL UNIQUE,
	"name" CHAR(50) NOT NULL,
	"accountID" CHAR(65) NOT NULL,
	"parent" CHAR(65),
	PRIMARY KEY("id")
) INHERITS ("document");




CREATE TABLE IF NOT EXISTS "userMethods" (
	"id" CHAR(65) NOT NULL UNIQUE,
	"name" CHAR(50) NOT NULL,
	"accountID" CHAR(65) NOT NULL,
	PRIMARY KEY("id")
) INHERITS ("document");




CREATE TABLE IF NOT EXISTS "transactionGroups" (
	"transactionID" CHAR(65) NOT NULL UNIQUE,
	"groupID" CHAR(65) NOT NULL
) INHERITS ("document");




CREATE TABLE IF NOT EXISTS "transactionMethods" (
	"transactionID" CHAR(65) NOT NULL UNIQUE,
	"methodID" CHAR(65) NOT NULL
) INHERITS ("document");



ALTER TABLE "document"
ADD FOREIGN KEY("modified_by") REFERENCES "account"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "transactions"
ADD FOREIGN KEY("accountID") REFERENCES "account"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "userGroupings"
ADD FOREIGN KEY("accountID") REFERENCES "account"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "userGroupings"
ADD FOREIGN KEY("parent") REFERENCES "userGroupings"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "userMethods"
ADD FOREIGN KEY("accountID") REFERENCES "account"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "transactionGroups"
ADD FOREIGN KEY("groupID") REFERENCES "userGroupings"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "transactionGroups"
ADD FOREIGN KEY("transactionID") REFERENCES "transactions"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "transactionMethods"
ADD FOREIGN KEY("methodID") REFERENCES "userMethods"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "transactionMethods"
ADD FOREIGN KEY("transactionID") REFERENCES "transactions"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;