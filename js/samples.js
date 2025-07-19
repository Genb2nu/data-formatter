class SampleData {
    static samples = {
        'json-users': {
            name: 'Users Data',
            format: 'json',
            data: `{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "age": 30,
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001",
        "country": "USA"
      },
      "interests": ["programming", "music", "travel"],
      "isActive": true,
      "registrationDate": "2023-01-15T10:30:00Z",
      "profile": {
        "avatar": "https://example.com/avatar1.jpg",
        "bio": "Software developer with 5 years of experience",
        "social": {
          "twitter": "@johndoe",
          "linkedin": "linkedin.com/in/johndoe"
        }
      }
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "age": 28,
      "address": {
        "street": "456 Oak Ave",
        "city": "San Francisco",
        "zipCode": "94102",
        "country": "USA"
      },
      "interests": ["design", "photography", "hiking"],
      "isActive": true,
      "registrationDate": "2023-02-20T14:45:00Z",
      "profile": {
        "avatar": "https://example.com/avatar2.jpg",
        "bio": "UX designer passionate about user-centered design",
        "social": {
          "twitter": "@janesmith",
          "linkedin": "linkedin.com/in/janesmith"
        }
      }
    },
    {
      "id": 3,
      "name": "Bob Johnson",
      "email": "bob.johnson@example.com",
      "age": 35,
      "address": {
        "street": "789 Pine Rd",
        "city": "Chicago",
        "zipCode": "60601",
        "country": "USA"
      },
      "interests": ["sports", "cooking", "reading"],
      "isActive": false,
      "registrationDate": "2022-12-10T09:15:00Z",
      "profile": {
        "avatar": "https://example.com/avatar3.jpg",
        "bio": "Marketing manager and food enthusiast",
        "social": {
          "twitter": "@bobjohnson",
          "linkedin": "linkedin.com/in/bobjohnson"
        }
      }
    }
  ],
  "metadata": {
    "totalUsers": 3,
    "activeUsers": 2,
    "lastUpdated": "2024-01-15T12:00:00Z",
    "version": "1.0"
  }
}`
        },

        'json-products': {
            name: 'Products Data',
            format: 'json',
            data: `{
  "products": [
    {
      "id": "P001",
      "name": "Wireless Bluetooth Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 199.99,
      "currency": "USD",
      "category": {
        "id": "C001",
        "name": "Electronics",
        "subcategory": "Audio"
      },
      "specifications": {
        "brand": "TechSound",
        "model": "TS-WH100",
        "color": "Black",
        "weight": "250g",
        "batteryLife": "30 hours",
        "connectivity": ["Bluetooth 5.0", "USB-C", "3.5mm Jack"]
      },
      "inventory": {
        "inStock": true,
        "quantity": 150,
        "warehouse": "WH-001",
        "lastRestocked": "2024-01-10T08:00:00Z"
      },
      "ratings": {
        "average": 4.5,
        "totalReviews": 248,
        "breakdown": {
          "5star": 156,
          "4star": 67,
          "3star": 18,
          "2star": 5,
          "1star": 2
        }
      },
      "tags": ["wireless", "bluetooth", "noise-cancelling", "portable"],
      "isNew": true,
      "isFeatured": true
    },
    {
      "id": "P002",
      "name": "Smart Fitness Watch",
      "description": "Advanced fitness tracker with heart rate monitoring",
      "price": 299.99,
      "currency": "USD",
      "category": {
        "id": "C002",
        "name": "Wearables",
        "subcategory": "Fitness"
      },
      "specifications": {
        "brand": "FitTech",
        "model": "FT-SW200",
        "color": "Silver",
        "weight": "45g",
        "batteryLife": "7 days",
        "waterResistance": "5ATM",
        "sensors": ["Heart Rate", "GPS", "Accelerometer", "Gyroscope"]
      },
      "inventory": {
        "inStock": true,
        "quantity": 75,
        "warehouse": "WH-002",
        "lastRestocked": "2024-01-08T14:30:00Z"
      },
      "ratings": {
        "average": 4.2,
        "totalReviews": 132,
        "breakdown": {
          "5star": 68,
          "4star": 41,
          "3star": 15,
          "2star": 6,
          "1star": 2
        }
      },
      "tags": ["smartwatch", "fitness", "GPS", "waterproof"],
      "isNew": false,
      "isFeatured": true
    }
  ],
  "categories": [
    {
      "id": "C001",
      "name": "Electronics",
      "description": "Electronic devices and accessories"
    },
    {
      "id": "C002",
      "name": "Wearables",
      "description": "Wearable technology and accessories"
    }
  ],
  "store": {
    "name": "TechStore",
    "currency": "USD",
    "timezone": "UTC",
    "lastUpdated": "2024-01-15T16:20:00Z"
  }
}`
        },

        'xml-books': {
            name: 'Books Catalog',
            format: 'xml',
            data: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
    <books>
        <book id="B001" isbn="978-0-123456-78-9">
            <title>The Art of Programming</title>
            <author>
                <firstName>John</firstName>
                <lastName>Code</lastName>
                <bio>Veteran software engineer with 20 years of experience</bio>
            </author>
            <publisher>
                <name>TechBooks Publishing</name>
                <location>San Francisco, CA</location>
                <website>https://techbooks.com</website>
            </publisher>
            <publication>
                <year>2023</year>
                <month>March</month>
                <edition>3rd</edition>
            </publication>
            <details>
                <pages>456</pages>
                <language>English</language>
                <format>Hardcover</format>
                <price currency="USD">49.99</price>
                <weight unit="grams">680</weight>
            </details>
            <categories>
                <category>Programming</category>
                <category>Computer Science</category>
                <category>Software Engineering</category>
            </categories>
            <description>
                A comprehensive guide to modern programming practices and principles.
                This book covers everything from basic syntax to advanced architectural patterns.
            </description>
            <reviews>
                <review rating="5">
                    <reviewer>Alice Developer</reviewer>
                    <comment>Excellent resource for both beginners and experienced programmers.</comment>
                    <date>2023-04-15</date>
                </review>
                <review rating="4">
                    <reviewer>Bob Coder</reviewer>
                    <comment>Great content, but could use more practical examples.</comment>
                    <date>2023-05-20</date>
                </review>
            </reviews>
            <availability>
                <inStock>true</inStock>
                <quantity>25</quantity>
                <warehouse>WH-SF-01</warehouse>
            </availability>
        </book>
        
        <book id="B002" isbn="978-0-987654-32-1">
            <title>Data Structures and Algorithms</title>
            <author>
                <firstName>Sarah</firstName>
                <lastName>Algorithm</lastName>
                <bio>Computer science professor and algorithm researcher</bio>
            </author>
            <publisher>
                <name>Academic Press</name>
                <location>Boston, MA</location>
                <website>https://academicpress.com</website>
            </publisher>
            <publication>
                <year>2023</year>
                <month>June</month>
                <edition>2nd</edition>
            </publication>
            <details>
                <pages>628</pages>
                <language>English</language>
                <format>Paperback</format>
                <price currency="USD">39.99</price>
                <weight unit="grams">520</weight>
            </details>
            <categories>
                <category>Computer Science</category>
                <category>Algorithms</category>
                <category>Data Structures</category>
            </categories>
            <description>
                In-depth exploration of fundamental data structures and algorithmic techniques.
                Includes complexity analysis and real-world applications.
            </description>
            <reviews>
                <review rating="5">
                    <reviewer>Charlie Student</reviewer>
                    <comment>Perfect for university courses. Clear explanations and good exercises.</comment>
                    <date>2023-07-10</date>
                </review>
                <review rating="5">
                    <reviewer>Diana Professor</reviewer>
                    <comment>I use this as a textbook. Students love the practical approach.</comment>
                    <date>2023-08-05</date>
                </review>
            </reviews>
            <availability>
                <inStock>true</inStock>
                <quantity>42</quantity>
                <warehouse>WH-BOS-01</warehouse>
            </availability>
        </book>
    </books>
    
    <metadata>
        <totalBooks>2</totalBooks>
        <totalCategories>5</totalCategories>
        <lastUpdated>2024-01-15T10:30:00Z</lastUpdated>
        <version>1.2</version>
    </metadata>
</catalog>`
        },

        'xml-employees': {
            name: 'Employee Records',
            format: 'xml',
            data: `<?xml version="1.0" encoding="UTF-8"?>
<company>
    <info>
        <name>TechCorp Solutions</name>
        <founded>2010</founded>
        <headquarters>
            <address>
                <street>100 Technology Drive</street>
                <city>San Jose</city>
                <state>California</state>
                <zipCode>95110</zipCode>
                <country>USA</country>
            </address>
        </headquarters>
        <totalEmployees>3</totalEmployees>
    </info>
    
    <departments>
        <department id="DEPT001">
            <name>Engineering</name>
            <budget currency="USD">2500000</budget>
            <manager>E001</manager>
        </department>
        <department id="DEPT002">
            <name>Marketing</name>
            <budget currency="USD">800000</budget>
            <manager>E003</manager>
        </department>
    </departments>
    
    <employees>
        <employee id="E001" status="active">
            <personalInfo>
                <firstName>Michael</firstName>
                <lastName>Chen</lastName>
                <email>michael.chen@techcorp.com</email>
                <phone>+1-555-0101</phone>
                <dateOfBirth>1985-08-15</dateOfBirth>
                <address>
                    <street>123 Developer Lane</street>
                    <city>Palo Alto</city>
                    <state>California</state>
                    <zipCode>94301</zipCode>
                    <country>USA</country>
                </address>
            </personalInfo>
            <employment>
                <position>Senior Software Engineer</position>
                <department>DEPT001</department>
                <startDate>2018-03-01</startDate>
                <salary currency="USD">120000</salary>
                <employmentType>Full-time</employmentType>
                <manager>none</manager>
            </employment>
            <skills>
                <skill level="expert">JavaScript</skill>
                <skill level="expert">Python</skill>
                <skill level="advanced">React</skill>
                <skill level="advanced">Node.js</skill>
                <skill level="intermediate">Docker</skill>
            </skills>
            <projects>
                <project id="PROJ001">
                    <name>Customer Portal Redesign</name>
                    <role>Lead Developer</role>
                    <startDate>2023-01-15</startDate>
                    <status>In Progress</status>
                </project>
            </projects>
        </employee>
        
        <employee id="E002" status="active">
            <personalInfo>
                <firstName>Emily</firstName>
                <lastName>Rodriguez</lastName>
                <email>emily.rodriguez@techcorp.com</email>
                <phone>+1-555-0102</phone>
                <dateOfBirth>1990-12-03</dateOfBirth>
                <address>
                    <street>456 Designer Street</street>
                    <city>San Francisco</city>
                    <state>California</state>
                    <zipCode>94102</zipCode>
                    <country>USA</country>
                </address>
            </personalInfo>
            <employment>
                <position>UX Designer</position>
                <department>DEPT001</department>
                <startDate>2020-06-15</startDate>
                <salary currency="USD">95000</salary>
                <employmentType>Full-time</employmentType>
                <manager>E001</manager>
            </employment>
            <skills>
                <skill level="expert">Figma</skill>
                <skill level="expert">Adobe Creative Suite</skill>
                <skill level="advanced">User Research</skill>
                <skill level="advanced">Prototyping</skill>
                <skill level="intermediate">HTML/CSS</skill>
            </skills>
            <projects>
                <project id="PROJ001">
                    <name>Customer Portal Redesign</name>
                    <role>UX Designer</role>
                    <startDate>2023-01-15</startDate>
                    <status>In Progress</status>
                </project>
            </projects>
        </employee>
        
        <employee id="E003" status="active">
            <personalInfo>
                <firstName>David</firstName>
                <lastName>Thompson</lastName>
                <email>david.thompson@techcorp.com</email>
                <phone>+1-555-0103</phone>
                <dateOfBirth>1982-05-22</dateOfBirth>
                <address>
                    <street>789 Marketing Boulevard</street>
                    <city>Mountain View</city>
                    <state>California</state>
                    <zipCode>94041</zipCode>
                    <country>USA</country>
                </address>
            </personalInfo>
            <employment>
                <position>Marketing Director</position>
                <department>DEPT002</department>
                <startDate>2015-09-01</startDate>
                <salary currency="USD">110000</salary>
                <employmentType>Full-time</employmentType>
                <manager>none</manager>
            </employment>
            <skills>
                <skill level="expert">Digital Marketing</skill>
                <skill level="expert">Brand Strategy</skill>
                <skill level="advanced">Analytics</skill>
                <skill level="advanced">Content Marketing</skill>
                <skill level="intermediate">SEO</skill>
            </skills>
            <projects>
                <project id="PROJ002">
                    <name>Q1 2024 Campaign</name>
                    <role>Project Manager</role>
                    <startDate>2024-01-01</startDate>
                    <status>Planning</status>
                </project>
            </projects>
        </employee>
    </employees>
    
    <metadata>
        <lastUpdated>2024-01-15T14:20:00Z</lastUpdated>
        <version>2.1</version>
        <exportedBy>HR System v3.2</exportedBy>
    </metadata>
</company>`
        }
    };

    static getSample(key) {
        const sample = this.samples[key];
        if (!sample) {
            throw new Error(`Sample '${key}' not found`);
        }
        return sample.data;
    }

    static getAllSamples() {
        return Object.keys(this.samples).map(key => ({
            key,
            name: this.samples[key].name,
            format: this.samples[key].format
        }));
    }

    static getSampleInfo(key) {
        const sample = this.samples[key];
        if (!sample) {
            throw new Error(`Sample '${key}' not found`);
        }
        return {
            key,
            name: sample.name,
            format: sample.format
        };
    }
}