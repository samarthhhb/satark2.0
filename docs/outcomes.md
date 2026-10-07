SATARK 2.0: Cloud-Based Cybercrime Intelligence and Risk Assessment Platform

Project Overview

SATARK 2.0 is a cloud-based cybercrime intelligence platform designed to demonstrate how cloud computing can be used to securely store, process, analyze, and deliver cybercrime information through a centralized web application. The project combines cloud infrastructure, cybersecurity, data analytics, and machine learning to create a practical decision-support system for understanding regional cybercrime risk.

The primary focus of SATARK 2.0 is not simply building a machine learning model, but developing a cloud-hosted system in which data, computing resources, APIs, security mechanisms, and predictive services work together. Historical cybercrime data is stored and processed through the cloud, while users access the system through a web-based interface. The platform can forecast the expected cybercrime burden for a district in the following year and classify the region as Low, Medium, or High risk.

Relevance to Cloud Computing

Modern cybersecurity systems often need to handle large datasets, multiple users, secure data access, and continuously available services. Deploying such systems locally can make data management, accessibility, and scalability more difficult. Cloud computing provides a suitable environment by offering centralized storage, on-demand computing, network-based access, and managed infrastructure.

SATARK demonstrates these concepts through AWS EC2 for application hosting and computation and AWS RDS PostgreSQL for managed database storage. A React-based frontend communicates with a FastAPI backend through REST APIs. The backend manages authentication, retrieves required data, performs machine learning inference, and stores prediction results.

This architecture makes the cloud an essential part of the project rather than simply the location where the final application is hosted.

Cybersecurity Component

Cybersecurity is an important part of the system because the platform handles user accounts and cybercrime-related information. Authentication and authorization mechanisms are incorporated to ensure that only permitted users can access protected services.

User passwords are stored using secure hashing rather than plaintext. JWT-based authentication can be used for API access, while AWS Security Groups restrict unnecessary network exposure. The PostgreSQL database can be configured so that it accepts connections only from the application server. Environment variables are used to keep database credentials and other secrets outside the application source code.

These measures demonstrate how security can be integrated into a cloud application architecture rather than added only after development.

Machine Learning and Analytics

Machine learning acts as the intelligence layer of SATARK 2.0. Historical cybercrime records are cleaned and aggregated at the State–District–Year level. A CatBoost regression model uses the current-year crime profile to estimate the following year’s total cybercrime burden. A separate classification model categorizes the predicted regional risk into Low, Medium, or High.

The predictions are delivered through the cloud backend and presented through the web dashboard. This allows the ML model to function as a service within a larger cloud-based application.

Applications

SATARK 2.0 has potential applications in several areas.

Law-enforcement agencies can use regional risk information to support resource planning, preventive campaigns, and cybersecurity awareness programs.

Government departments can use cloud-based dashboards to examine regional trends and identify areas that may require additional digital-safety initiatives.

Cybersecurity organizations can use regional risk indicators as an additional source of intelligence when planning monitoring and awareness activities.

Educational and research institutions can use the project as a practical case study covering cloud architecture, cybersecurity, APIs, databases, predictive analytics, and secure application deployment.

Scope

The initial implementation focuses on a simple and manageable cloud architecture consisting of an AWS EC2 application server and AWS RDS PostgreSQL database. The frontend, backend, ML models, and API services can operate through the same application environment, keeping deployment straightforward.

The architecture can later be expanded with containerization, CI/CD pipelines, HTTPS, cloud monitoring, centralized logging, load balancing, role-based access control, object storage, real-time data feeds, and automated model updates. These extensions could improve scalability and make the system more suitable for larger datasets and multiple users.

Expected Outcome

The expected outcome is a functional cloud-hosted cybercrime intelligence platform where users can securely log in, select a region and year, request a forecast, and view the resulting risk assessment through an interactive dashboard.

Overall, SATARK 2.0 demonstrates how Cloud Computing can provide the foundation for a secure cybercrime intelligence system, while machine learning supplies predictive capabilities. The project therefore brings together cloud infrastructure, cybersecurity, databases, APIs, visualization, and AI into one practical application, with the cloud serving as the central platform through which the entire system operates.
