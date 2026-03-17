Akdeniz University

Department of Computer Engineering

Software Engineering Project

ANTAPP: Route Planning & Social Platform

Software Requirements Specification

Yahya Efe Kuruçay, Alperen Ulukaya, Ramazan Seçilmiş, Serhat Buğra Tana

**Team Leader:** Yahya Efe Kuruçay

**Product Owner:** Product Owner's Name

**Instructor:** Prof. Ümit Deniz ULUŞAR

28.02.2026

This report is submitted to the Department of Computer Engineering of Akdeniz University of the Software Engineering course CSE332.

| **Abbreviations** |     |
| --- |     | --- |
| API | Application Programming Interface |
| APNs | Apple Push Notification service |
| CRUD | Create, Read, Update, Delete |
| DBMS | Database Management System |
| FCM | Firebase Cloud Messaging |
| GPS | Global Positioning System |
| HTTPS | Hypertext Transfer Protocol Secure |
| IP  | Internet Protocol |
| iOS | iPhone Operating System |
| JWT | JSON Web Token |
| KVKK | Kisisel Verilerin Korunmasi Kanunu (Turkish Personal Data Protection Law) |
| MVP | Minimum Viable Product |
| PPC | Pay-Per-Click |
| REST | Representational State Transfer |
| SDK | Software Development Kit |
| SRS | Software Requirements Specification |
| TLS | Transport Layer Security |
| UI  | User Interface |
| UUID | Universally Unique Identifier |
| UX  | User Experience |

Contents

[1 Introduction 1](#_Toc1659209)

[1.1 Purpose 1](#_Toc1659210)

[1.2 Product Scope 1](#_Toc1659211)

[1.3 References 1](#_Toc1659212)

[2 Overall Description 1](#_Toc1659213)

[2.1 Product Perspective 1](#_Toc1659214)

[2.2 Product Functions 1](#_Toc1659215)

[2.3 User Classes and Characteristics 1](#_Toc1659216)

[2.4 Operating Environment 1](#_Toc1659217)

[2.5 Design and Implementation Constraints 1](#_Toc1659218)

[2.6 User Documentation 2](#_Toc1659219)

[2.7 Assumptions and Dependencies 2](#_Toc1659220)

[3 External Interface Requirements 2](#_Toc1659221)

[3.1 User Interfaces 2](#_Toc1659222)

[3.2 Hardware Interfaces 2](#_Toc1659223)

[3.3 Software Interfaces 2](#_Toc1659224)

[3.4 Communications Interfaces 2](#_Toc1659225)

[4 System Features 2](#_Toc1659226)

[4.1 System Feature 1 2](#_Toc1659227)

[4.1.1 Description and Priority 2](#_Toc1659228)

[4.1.2 Stimulus/Response Sequences 2](#_Toc1659229)

[4.1.3 Functional Requirements 3](#_Toc1659230)

[4.2 System Feature 2 (and so on) 3](#_Toc1659231)

[5 Use Cases 3](#_Toc1659232)

[5.1 Creating an new account 3](#_Toc1659233)

[5.2 Deleting an account 3](#_Toc1659234)

[6 Nonfunctional System Requirements 4](#_Toc1659235)

[6.1 Performance Requirements 4](#_Toc1659236)

[6.2 Safety Requirements 4](#_Toc1659237)

[6.3 Security Requirements 4](#_Toc1659238)

[6.4 Software Quality Attributes 4](#_Toc1659239)

[6.5 Business Rules 4](#_Toc1659240)

[7 Other Requirements 4](#_Toc1659241)

[8 Proposed System 5](#_Toc1659242)

[8.1 Overview 5](#_Toc1659243)

[8.2 Functional Requirements 5](#_Toc1659244)

[8.3 Non-functional Requirements 5](#_Toc1659245)

[8.4 Pseudo Requirements 6](#_Toc1659246)

[8.5 System Models 6](#_Toc1659247)

[8.5.1 Scenarios 6](#_Toc1659248)

[8.5.1.1. Standard User Navigates a Route Scenario 6](#_Toc1659249)

[8.5.2 Use-Case Model 6](#_Toc1659250)

[8.5.3 Object and Class Model 6](#_Toc1659251)

[8.5.4 Dynamic Models 7](#_Toc1659252)

[8.5.5 User Interface 7](#_Toc1659253)

[8.5.6 Test 7](#_Toc1659254)

[9 References 7](#_Toc1659255)

[10 Appendix A: Glossary 7](#_Toc1659256)

# Introduction

## Purpose

This Software Requirements Specification (SRS) document defines the complete functional and non-functional requirements for AntAPP - a location-based social route discovery and sharing platform targeted initially at the city of Antalya, Turkey, with a roadmap to expand nationally and globally.

AntAPP aims to bridge the gap between static city-guide applications and fully dynamic navigation tools by enabling users to discover, create, share, and collaboratively extend location-based routes. The platform consists of a mobile application (iOS & Android) for on-the-go discovery and navigation and a web portal for administrative management.

This document is intended as the primary reference for the development team, product owner, and course instructor. It covers the system scope, user classes, interface requirements, functional and non-functional requirements, and use cases for the first release (MVP) of AntAPP.

## Product Scope

AntAPP (Antalya Application) is a cross-platform mobile and web application that allows residents, tourists, and students to discover and navigate curated or community-created routes around Antalya's key attractions, neighborhoods, and natural areas.

Core capabilities of the first release include:

• Browsing and filtering official and community routes by category (Nature, History, Entertainment, Food & Beverage, etc.)

• Viewing route details including stops, descriptions, distance.

• Starting live map-based navigation along a selected route

• Creating custom routes by pinning stops on an interactive map with and descriptions

• Forking (cloning) an existing route to personalize and re-publish

• Rating and saving routes to personal collections

• Viewing a real-time heatmap showing crowd density across the city

• Administrative management of official routes, categories, and user roles

The system will store all data on a cloud-hosted relational database. Map rendering will rely on an external map.

AntAPP's revenue model follows an ad-supported (free tier) and premium (ad-free) approach: businesses can purchase sponsored placement on route stops, while premium users enjoy an ad-free experience.

## References

• Google Maps Platform Documentation - <https://developers.google.com/maps>  
• Turkish Personal Data Protection Law (KVKK / Law No. 6698) - <https://www.kvkk.gov.tr>

# Overall Description

## Product Perspective

AntAPP is a new, self-contained product with no direct predecessor system. It is designed from the ground up as a location-based social platform. The system is composed of three interconnected subsystems:

• Mobile Application (iOS & Android): The primary end-user interface. Users browse routes, navigate in real time, create and fork routes, and interact with community content.

• Web Portal (Admin Panel): A browser-based management interface for administrators to create official routes, manage categories, moderate community content, and view analytics.

• Backend API Server: A RESTful API that serves both the mobile app and web portal. It manages all business logic, authentication, and database interactions.

All three subsystems communicate with a shared relational database hosted on a cloud server. The mobile application and web portal interact exclusively through the backend API; neither accesses the database directly. External map services are integrated via their respective SDKs and APIs.

## Product Functions

| **Functional Group** | **Key Functions** |
| --- | --- |
| **User Management** | Registration, login, profile management, role assignment (User / Business / Admin) |
| **Route Discovery** | Browse by category, search by keyword, view on list or map, heatmap overlay |
| **Route Navigation** | Start live GPS navigation along a route, view stops sequentially on map |
| **Route Creation** | Create routes by pinning stops on a map, add titles / descriptions per stop, assign category |
| **Route Forking** | Clone an existing route, modify stops, re-publish under own profile with attribution |
| **Social Interaction** | Rate routes (1-5 stars), save routes to personal collections, leaving comment, following other users |
| **Admin Management** | Create/edit/delete official routes, manage categories, moderate community content, manage users, |
| **Live Heatmap** | Real-time crowd density overlay on map (green = quiet, red = busy) |
| **Revenue Engine** | Business-sponsored stop placements, premium (ad-free) subscriptions |

## User Types and Characteristics

### AntAPP distinguishes three primary user classes  

<br/>Standard User (Students, Locals, Tourist)

The largest user group. Includes locals exploring their own city, tourists discovering Antalya, and students seeking activities. Standard users can browse, navigate, create, fork, rate, and save routes. They are assumed to have basic smartphone proficiency. Free-tier accounts see sponsored content.

### Business Account

Business accounts are intended for local businesses such as restaurants, cafés, tour operators, hotels, and entertainment venues in Antalya. These users can sponsor route stops, promote their venues within relevant route categories, and gain increased visibility through highlighted placements. Business users can manage their business profile (description, images, contact information), view basic analytics (views, clicks, route impressions), promote special offers or events (subject to admin approval), business accounts have limited access compared to administrators and cannot moderate content or manage system-level settings. They interact primarily through the mobile application and, in later versions, through a dedicated business dashboard.

### Administrator

System administrators with full access to the web portal. Admins create and manage Official Routes (pre-approved, verified itineraries), manage route categories, approve or remove community content and business information that violates guidelines, and access the analytics dashboard. Admins do not interact with the mobile application in their administrative capacity.

## Operating Environment

• Mobile Application: Acceptable iOS and Android versions. Requires device GPS and internet connection. React-Native Cross Platform

• Web Portal: Client Side, Users Laptop and PC's browsers.

• Backend Server: Linux-based cloud server on Microsoft Azure, with .NET framework

• Database: PostgreSQL (or equivalent relational DBMS with PostGIS extension for geospatial queries).

• External Services: Third party API (e.g. Google Maps Platform) for map rendering and routing; a cloud storage service (Microsoft Azure Blob Storage) for user-uploaded photos; a push notification service (e.g., Firebase Cloud Messaging) for alerts.

• Network: All clients require a stable Internet connection. The application is non-functional in fully offline mode.

## Design and Implementation Constraints

• Clean Architecture: The system must follow a layered Clean Architecture pattern separating Presentation, Domain (Use Cases), and Data layers. This ensures testability and maintainability.

• SOLID Principles: All backend and mobile code must adhere to SOLID design principles to facilitate future feature expansion.

• Internet Dependency: AntAPP requires a live Internet connection for map rendering, heatmap data, photo uploads, and all API calls. An offline fallback is out of scope for MVP.

• Map API Quotas: Usage of Google Maps / Mapbox APIs introduces cost and rate-limit constraints. The system must implement caching strategies to minimize unnecessary API calls.

• Database Capacity: A shared PostgreSQL instance will be used. Concurrent write-heavy operations (e.g., heatmap updates) must be designed to avoid lock contention.

• KVKK Compliance: The system must comply with Turkish data protection law. User location data may only be collected with explicit consent and must not be shared with third parties without user approval.

• Mobile Battery & Memory: The mobile app must limit background GPS polling frequency to preserve device battery.

• Technology Stack: Backend in .NET; mobile in React Native for cross-platform development; web portal in NextJS.

## User Documentation

## • In-App Onboarding: A screen interactive tutorial shown to first-time users covering route discovery, navigation, and creation

## • Help & FAQ Section: Accessible from the user profile menu, covering common user questions

## • Admin User Manual: A web-based guide for administrators covering route management, moderation tools, and analytics

• Business Acc Manual: A YouTube video guide for businesses.

## Assumptions and Dependencies

User Permissions: Users will grant required permissions (Location, Camera, Storage). Without them, core features like route tracking and media sharing will not function.

Device Capabilities: Most users have smartphones with GPS and sufficient performance to run the app smoothly.

User Literacy: Users are familiar with basic mobile apps, social networks, and map navigation.

Third-Party APIs: Destination discovery and route rendering depend on external mapping services (e.g., Google Maps). Any service disruption or pricing changes may directly affect AntAPP.

Mobile Market Ecosystems: App distribution and updates rely on Google Play Store and Apple App Store policies and approval processes.

Cloud Infrastructure: The backend (.NET) and database depend on the reliability, security, and uptime of the selected cloud provider.

# External Interface Requirements

## User Interfaces

• Onboarding Screen: Displayed to first-time users. Asks for user type (Local Resident / Tourist / Student) and primary interest (Nature / History / Food & Entertainment / All). This data personalizes the default route feed. It also includes a short user-manual.

• Home / Route List Screen: Displays a categorized, scrollable list of routes. A sticky filter bar allows filtering by category. A floating 'Map View' button switches to the map view without losing filter state.

• Map View Screen: Displays all routes as color-coded pins on an interactive map. Heatmap overlay can be toggled. Tapping a pin opens a route summary card.

• Route Detail Screen: Shows route name, category badge, author, rating (star average), total stops, estimated duration, total distance, and a stop-by-stop list with photos and descriptions. Buttons: 'Start Navigation', 'Fork Route', 'Save to Collection', 'Rate'.

• Live Navigation Screen: Full-screen map showing the user's current GPS position, the active route polyline, and the next stop highlighted. A bottom drawer shows the current stop's name and description.

• Route Creation Screen: Map-based stop builder. Users tap the map to add stops; each stop triggers a form for title, description, and optional photo upload.

• User Profile Screen: Shows user statistics (routes created, routes completed, average rating received), saved collections, and settings (language: TR / EN, notification preferences).

• Admin Web Portal: A responsive web dashboard. Left sidebar navigation: Routes, Categories, Users, Analytics. Route management table with CRUD actions.

• Business Web Portal: A web-based dashboard for business accounts to manage their company profile, sponsor route stops, and create promotional campaigns. It also provides basic analytics such as views, clicks, and engagement statistics.

## Hardware Interfaces

• GPS / Location Services: The mobile application interfaces with the device's GPS hardware to obtain the user's real-time coordinates for live navigation and heatmap contribution. Location is sampled every 5 seconds during active navigation.

• Camera: The mobile application accesses the device camera (via OS-level permissions) to allow users to capture and attach photos to route stops during creation.

• Network Interface: Both mobile and web clients communicate with the backend exclusively over HTTPS using the device's Wi-Fi or cellular network interface.

## Software Interfaces

•Map API (Google Maps Platform or Mapbox): Used for interactive map rendering, geocoding (place name to coordinates), and routing (drawing polylines between stops). Integration via official SDK.  

•Cloud Storage (Azure or equivalent): User-uploaded stop photos are stored in a cloud object storage bucket. The backend generates signed URLs for secure upload and retrieval.  

•Push Notification Services (FCM / APNs/ Appwrite Messaging ) : Used to deliver push notifications (e.g., new route recommendations, weekly city tip) to mobile clients.  

•Authentication: JSON Web Tokens (JWT) for stateless API authentication. OAuth 2.0 support for third-party login (Google) may be added in a future phase.  

•Database (PostgreSQL + PostGIS): Relational database for all persistent data. The PostGIS extension enables efficient geospatial queries (e.g., 'find all routes within 2 km of this coordinate').

# System Features / Requirements

Functional requirements are grouped by user class. Each requirement follows the format ID / PRIORITY / DESC / RAT / DEP.

4.1 User Class: Users and Business Accounts (Authentication & Onboarding)  

FR-01: User Registration

PRIORITY: High

DESC: A new user shall be able to register via the mobile application by providing a username, e-mail address, and password. The system shall validate e-mail uniqueness and password strength (minimum 8 characters, at least one digit).

RAT: To establish a persistent identity that enables personalised content, route authorship, and social features.

DEP: None  

FR-02: User Login

PRIORITY: High

DESC: A registered user shall be able to log in with their e-mail and password. On successful login, the server shall return a signed JWT token. The mobile app shall store this token securely and include it in all subsequent authenticated requests.

RAT: To grant access to personalised and write-protected features.

DEP: FR-01

FR-03: Onboarding Profiling

PRIORITY: High

DESC: On first login, the user shall be presented with an onboarding flow asking: (a) user type - Local Resident, Tourist, or Student; (b) primary interest - Nature, History, Food & Entertainment, or All. Responses shall be stored and used to personalise the default route feed.

RAT: To provide a personalised experience from the very first session, increasing engagement.

DEP: FR-01, FR-02

FR-04: Password Recovery

PRIORITY: Medium

DESC: A user who has forgotten their password shall be able to request a password-reset link via their registered e-mail. The link shall expire after 1 hour.

RAT: To reduce account lockouts and improve user retention.

DEP: FR-01

FR-05: User Profile Management

PRIORITY: Medium

DESC: A logged-in user shall be able to edit their display name, profile photo, and preferred language (Turkish or English). The system shall reflect language changes immediately without requiring a restart.

RAT: To allow users to maintain an up-to-date and personalised profile.

DEP: FR-02

4.2 User Class: Standard User (Route Discovery & Navigation)

FR-06: Browse Routes - List View

PRIORITY: High

DESC: The home screen shall display a paginated list of routes. Each list item shall show the route thumbnail, name, category badge, star rating, and estimated duration. Routes shall default to sorted by rating (descending). Users may filter by category and sort by rating, distance (from current location), or newest.

RAT: To allow users to efficiently discover relevant routes without overwhelming them.

DEP: FR-02

FR-07: Browse Routes - Map View

PRIORITY: High

DESC: Users shall be able to switch to a map view that shows all routes as colour-coded pins centred on their current GPS location. Tapping a pin shall open a bottom-sheet summary card with route name, rating, and a 'View Details' button.

RAT: To support spatial discovery - users can see what routes are physically near them.

DEP: FR-02, FR-06

FR-08: View Route Details

PRIORITY: High

DESC: Tapping a route (from list or map view) shall open a detail screen displaying: route name, category, author, aggregate star rating, total distance, estimated duration, and a sequential list of stops. Each stop shall include name, description, and photo (if available). Action buttons: Start Navigation, Fork Route, Save to Collection, Rate.

RAT: To provide all information a user needs to decide whether to start a route.

DEP: FR-06

FR-09: Live Navigation

PRIORITY: Low

DESC: When a user taps 'Start Navigation' on a route detail screen, the application shall open a full-screen map showing: the user's live GPS position (blue dot), the complete route polyline, and the next upcoming stop highlighted. A bottom drawer shall display the next stop's name and description. The system shall automatically advance to the next stop when the user is within 50 metres of the current stop.

RAT: To guide users through a route in real time, making the experience seamless and hands-free.

DEP: FR-08

FR-10: Rate a Route

PRIORITY: Medium

DESC: A logged-in user who has viewed a route detail page shall be able to submit a star rating (1-5). Each user may rate a given route only once. The aggregate rating shall be recalculated and displayed immediately.

RAT: To provide social proof and quality signals that help other users choose routes.

DEP: FR-08

FR-11: Save Route to Collection

PRIORITY: Medium

DESC: A logged-in user shall be able to save any route to their personal 'Saved' collection by tapping a bookmark icon. Saved routes shall be accessible from the user's profile screen even without an internet connection (last-cached version).

RAT: To allow users to build a personal library of favourite routes for future reference.

DEP: FR-08

4.3 User Class: Standard User (Route Creation & Forking)

FR-12: Create a Custom Route

PRIORITY: High

DESC: A logged-in user shall be able to create a new route by: (1) entering a title and description; (2) selecting a category; (3) opening the map and tapping locations to add stops (minimum 2 stops required); (4) optionally adding a title, description, and photo to each stop; (5) publishing the route. Published routes appear in the Community Routes section of the home screen.

RAT: To allow the community to contribute content and grow the platform's route library organically.

DEP: FR-02

FR-13: Fork / Clone a Route

PRIORITY: High

DESC: From any route detail screen, a logged-in user shall be able to tap 'Fork Route'. The system shall create an editable copy of the route under the user's profile with the original route ID preserved as a reference (attribution). The user may add, remove, or reorder stops before publishing as a new route.

RAT: To allow creative remixing of existing routes, encouraging community contribution and reducing the barrier to route creation.

DEP: FR-08, FR-12

4.4 User Class: Administrator (Route & System Management)

FR-14: Admin Login - Web Portal

PRIORITY: High

DESC: Administrators shall log in to the web portal using their credentials. Admin accounts shall be created by an existing administrator or by direct database seeding. The system shall enforce role-based access control so that admin-only endpoints are inaccessible to standard user tokens.

RAT: To protect administrative functions from unauthorised access.

DEP: FR-01

FR-15: Create Official Route

PRIORITY: High

DESC: An administrator shall be able to create a new 'Official' route via the web portal by specifying title, description, category, and stops (with photos and descriptions). Official routes are marked with a verified badge in the mobile app and appear at the top of route listings.

RAT: To seed the platform with high-quality, verified content at launch.

DEP: FR-14

FR-16: Edit / Delete Any Route

PRIORITY: High

DESC: An administrator shall be able to edit or delete any route (official or community) from the web portal. Deleted routes shall be soft-deleted (hidden from users but retained in the database for audit purposes).

RAT: To maintain content quality and remove guideline-violating content.

DEP: FR-14

FR-17: Manage Categories

PRIORITY: Medium

DESC: An administrator shall be able to create, rename, or deactivate route categories. Deactivated categories shall not appear in filter options, but existing routes assigned to that category shall retain the assignment for historical accuracy.

RAT: To give administrators control over how routes are organised and discovered.

DEP: FR-14

4.5 User Class: Business Account (Venue Promotion & Analytics)

FR-18: Business Account Registration

PRIORITY: High

DESC: A business user shall be able to register a Business Account via the mobile application or web portal by providing: business name, contact person name, e-mail address, password, phone number, and business category. The system shall validate e-mail uniqueness and require password strength (minimum 8 characters, at least one digit).

RAT: To allow verified venues and businesses to participate in the platform ecosystem.

DEP: FR-01

FR-19: Business Verification

PRIORITY: High

DESC: After registration, a Business Account shall remain in "Pending Verification" status until approved by an administrator. An administrator shall review submitted business details and approve or reject the account via the web portal. Only verified businesses may publish promotional content or sponsored routes.

RAT: To prevent fake listings and ensure trust and authenticity within the platform.

DEP: FR-18, FR-14  
<br/>FR-20: Create Sponsored Route

PRIORITY: High

DESC: A verified Business Account shall be able to create a sponsored route highlighting their venue and nearby attractions. Sponsored routes shall be marked with a "Sponsored" badge in both list and map views. Sponsored routes may optionally be prioritised in search results.

RAT: To provide a monetisation channel while clearly distinguishing paid content from community routes.

DEP: FR-19, FR-12  
<br/>FR-21: Promote Venue on Map

PRIORITY: Medium

DESC: A verified Business Account shall be able to activate a promoted venue pin on the map view. Promoted venues shall appear with a distinct visual marker. Tapping the pin shall open a business profile card displaying business name, description, photos, contact information, opening hours, and a "Navigate" button.

RAT: To increase venue visibility and foot traffic through location-based discovery.

DEP: FR-20, FR-07  
<br/>FR-22: View Business Analytics

PRIORITY: Medium

DESC: A verified Business Account shall have access to an analytics dashboard displaying:

Total views of their sponsored routes

Number of route starts

Number of venue pin taps

Average rating of sponsored routes

Heatmap of user interactions by time of day

Analytics data shall update at least every 24 hours.

RAT: To provide measurable value and performance insights to business partners.

DEP: FR-20, FR-21  
<br/><br/>FR-23: Edit Business Profile

PRIORITY: Medium

DESC: A verified Business Account shall be able to edit their business profile information (description, photos, contact details, opening hours). Changes shall be reflected immediately in the mobile application.

RAT: To ensure business information remains accurate and up-to-date.

DEP: FR-20

FR-24: Deactivate Business Account

PRIORITY: Low

DESC: A Business Account shall be able to request account deactivation. Deactivated accounts shall no longer display sponsored routes or promoted venue pins, but historical analytics data shall be retained for audit purposes.

RAT: To provide flexibility while preserving system integrity and historical data.

DEP: FR-20  

4.6 User Class: Business Account (Monetisation Model)

FR-25: Subscription Tier Selection

PRIORITY: High

DESC: A verified Business Account shall be able to subscribe to one of the available subscription tiers (e.g., Basic, Pro, Premium). Each tier shall define limits and benefits including:

Maximum number of sponsored routes, Maximum number of promoted venue pins, Access to analytics features, Priority placement in route listings, Subscription details and pricing shall be displayed clearly before confirmation.

RAT: To establish a predictable recurring revenue model while offering scalable feature access based on business needs.

DEP: FR-20

FR-26: Subscription Billing & Renewal

PRIORITY: High

DESC: The system shall support secure online payments for subscription plans via an integrated payment gateway. Subscriptions shall renew automatically on a monthly basis unless cancelled. The system shall notify the business user 3 days before renewal. Failed payments shall result in a 7-day grace period before feature suspension.

RAT: To automate recurring revenue collection and reduce manual administrative overhead.

DEP: FR-25

FR-27: Pay-Per-Click (PPC) Promotion Model

PRIORITY: Medium

DESC: A verified Business Account shall be able to activate a pay-per-click promotion for a sponsored route or promoted venue pin. The system shall deduct a predefined fee from the business's wallet balance each time a user taps the promoted content. The business shall be able to set a daily budget cap. Promotions shall automatically pause when the daily budget is exhausted.

RAT: To provide a performance-based monetisation option aligned with measurable engagement.

DEP: FR-22, FR-21

FR-28: Pay-Per-Route-Start Model

PRIORITY: Medium

DESC: A verified Business Account shall be able to activate a pay-per-route-start model in which a predefined fee is deducted each time a user taps "Start Navigation" on a sponsored route. The system shall track route-start events accurately and display them in the analytics dashboard.

RAT: To align monetisation with high-intent user engagement rather than passive impressions.

DEP: FR-21, FR-22

FR-29: Business Wallet & Transaction History

PRIORITY: Medium

DESC: Each Business Account shall have a digital wallet that stores prepaid credit. The wallet shall display:Current balance, Transaction history (charges, renewals, PPC deductions, route-start deductions), Wallet balance shall decrease in real time as billable events occur.

RAT: To provide transparency and financial traceability for business users.

DEP: FR-27, FR-28

FR-30: Campaign Duration & Scheduling

PRIORITY: Medium

DESC: A Business Account shall be able to define start and end dates for PPC or Pay-Per-Route campaigns. Campaigns shall automatically activate and deactivate according to the defined schedule.

RAT: To allow businesses to run time-limited promotions aligned with events or seasonal demand.

DEP: FR-28, FR-29

4.7 Live Heatmap

FR-31: Display Real-Time Crowd Heatmap

PRIORITY: Medium

DESC: The map view shall include a toggleable heatmap overlay. The overlay shall visualise the relative density of active app users in each area of the city at any given moment. High-density zones shall appear red; moderate zones orange; low-density zones green. The data shall refresh every 30 seconds.

RAT: To help users avoid crowded areas or discover where activity is happening, adding unique real-time value.

DEP: FR-07

# Use Cases

## Browse and Start a Route

| **Use Case ID** | UC-01 |
| --- | --- |
| **Use Case Name** | Browse and Start a Route |
| **Actors** | Standard User |
| **Pre-conditions** | User is logged in. GPS is enabled on the device. |
| **Post-conditions** | Live navigation has started along the selected route. |
| **Basic Flow** | 1\. User opens the app and lands on the Home (Route List) screen. 2. User taps a category filter (e.g., 'History'). 3. The list refreshes to show only History routes, sorted by rating. 4. User taps a route card (e.g., 'Classic Kaleiçi Tour'). 5. Route Detail screen opens showing stops, rating, and distance. 6. User taps 'Start Navigation'. 7. The app requests GPS permission if not already granted. 8. Live Navigation screen opens with the route polyline and first stop highlighted. |
| **Alternative Flow** | User denies GPS permission → App shows an error message and returns to the Route Detail screen. |

## Create a Custom Route

| **Use Case ID** | UC-02 |
| --- | --- |
| **Use Case Name** | Create a Custom Route |
| **Actors** | Standard User |
| **Pre-conditions** | User is logged in. |
| **Post-conditions** | The new route is published and appears in the Community Routes feed. |
| **Basic Flow** | 1\. User taps the '+' (Create Route) button on the Home screen. 2. Route Creation screen opens with an empty map. 3. User enters a route title, description, and selects a category. 4. User taps on the map to add Stop 1; a form appears for stop title, description, and optional photo. 5. User repeats step 4 for at least one more stop. 6. User taps 'Publish'. 7. The system validates that at least 2 stops are present. 8. Route is saved and the user is redirected to the new route's detail screen. |
| **Alternative Flow** | User attempts to publish with fewer than 2 stops → Validation error displayed; user must add more stops before publishing. |

## Fork an Existing Route

| **Use Case ID** | UC-03 |
| --- | --- |
| **Use Case Name** | Fork / Clone a Route |
| **Actors** | Standard User |
| **Pre-conditions** | User is logged in. User is viewing a Route Detail screen. |
| **Post-conditions** | A personalised copy of the route is saved under the user's profile. |
| **Basic Flow** | 1\. User taps 'Fork Route' on the Route Detail screen. 2. System creates a copy of the route and opens it in the Route Creation/Edit screen. 3. The fork is attributed to the original route (original author and ID are displayed). 4. User modifies stops (adds, removes, or reorders). 5. User taps 'Publish'. 6. The forked route is published under the user's profile and appears in the Community Routes feed. |
| **Alternative Flow** | User forks a route and publishes without modifications → Allowed; the system attributes the route to the original. |

## Admin Creates an Official Route

| **Use Case ID** | UC-04 |
| --- | --- |
| **Use Case Name** | Admin Creates an Official Route |
| **Actors** | Administrator |
| **Pre-conditions** | Admin is logged in to the web portal. |
| **Post-conditions** | The official route is published and appears at the top of the mobile app's route list with a verified badge. |
| **Basic Flow** | 1\. Admin navigates to 'Routes' in the web portal sidebar. 2. Admin clicks 'New Route'. 3. Admin enters route title, description, and selects a category. 4. Admin adds stops via the embedded map interface, providing name, description, and photo for each stop. 5. Admin marks the route as 'Official'. 6. Admin clicks 'Publish'. 7. The system validates the route and saves it with the 'Official' flag. 8. The route immediately appears at the top of mobile app listings. |
| **Alternative Flow** | Admin tries to publish without at least 2 stops → Validation error displayed. |

## User Registration and Onboarding

| **Use Case ID** | UC-05 |
| --- | --- |
| **Use Case Name** | User Registration and Onboarding |
| **Actors** | New (unregistered) user |
| **Pre-conditions** | User has installed the mobile application. No account exists. |
| **Post-conditions** | A new user account is created; user's profile preferences are saved; user lands on the Home screen. |
| **Basic Flow** | 1\. User opens the app for the first time and is shown the registration screen. 2. User enters username, e-mail, and password and taps 'Sign Up'. 3. System validates input (unique e-mail, password strength). 4. Account is created; JWT token is issued and stored locally. 5. Onboarding screen appears: user selects their user type (Local / Tourist / Student). 6. Onboarding screen 2: user selects primary interest (Nature / History / Food & Entertainment / All). 7. Preferences are saved to the user's profile. 8. User lands on the personalised Home screen. |
| **Alternative Flow** | E-mail already registered → Error shown; user directed to login or password recovery. |

# Nonfunctional System Requirements

![CS 410/510 - Software Engineering class notes](https://www.cs.ccsu.edu/~stan/classes/CS410/notes16/images/04-nonfunctional_requirement_types.png)

## Performance Requirements

NF-01

TAG: Route List Load Time

GIST: Speed of loading the home route list

SCALE: Time from user opening the app (already logged in) to the route list being fully rendered

METER: Average over 500 test sessions on a standard 4G connection

MUST: Under 2 seconds 95% of the time

WISH: Under 1 second 95% of the time

NF-02

TAG: Map Tile Rendering

GIST: Speed of interactive map initialisation

SCALE: Time from tapping 'Map View' to the first set of map tiles and route pins being visible

METER: Average over 500 test sessions on standard 4G

MUST: Under 3 seconds 95% of the time

WISH: Under 1.5 seconds 95% of the time

NF-03

TAG: Route Creation Save

GIST: Time to save and publish a newly created route

SCALE: Time from user tapping 'Publish' to the route appearing on the server (API round-trip)

METER: Measured from server logs over 200 test submissions

MUST: Under 3 seconds 99% of the time

WISH: Under 1.5 seconds 99% of the time

NF-04

TAG: Heatmap Refresh Latency

GIST: Freshness of crowd-density data shown on the heatmap

SCALE: Age of the data shown at any given moment

METER: Continuous monitoring during load testing with 500 concurrent users

MUST: Data no older than 60 seconds

WISH: Data no older than 30 seconds

NF-05

TAG: Concurrent User Capacity

GIST: System scalability under load

SCALE: Number of simultaneous active users the system handles without degradation

METER: Load test using simulated concurrent sessions

MUST: At least 500 concurrent users without response time increase > 20%

WISH: At least 2,000 concurrent users

## Safety Requirements

• AntAPP must not display navigation instructions that encourage users to cross private property, construction sites, or otherwise unsafe areas. All route stops must be publicly accessible locations.

• The live navigation screen must not auto-advance stops while the device is detected to be moving at vehicle speed (>30 km/h) to discourage use while driving.

• The application must display a safety reminder when a user starts a route at night (between 22:00 and 06:00 local time).

• Users must be able to exit live navigation and return to the home screen at any time with a single tap.

## Security Requirements

• All API communications must use HTTPS with TLS 1.2 or higher. Unencrypted HTTP connections must be rejected by the backend server.

• JWT access tokens must expire after 24 hours. Refresh tokens must be stored securely on the device using the OS keychain or equivalent secure storage mechanism.

• User passwords must be hashed using bcrypt (minimum cost factor 12) or an equivalent adaptive hashing algorithm before storage. Plaintext passwords must never be stored or logged.

• The authentication endpoint must enforce rate limiting of no more than 10 failed login attempts per account per 15-minute window. Accounts exceeding this threshold must be temporarily locked.

• The backend must enforce role-based access control (RBAC). Admin-only API endpoints must reject requests carrying standard user or business JWT tokens with HTTP 403 Forbidden.

• All user-supplied inputs (route titles, stop descriptions, search queries) must be validated and sanitised on the server side to prevent SQL injection and cross-site scripting (XSS) attacks.

• All sensitive data at rest in the PostgreSQL database (including user PII and location history) must be encrypted using AES-256 or equivalent, in compliance with KVKK Article 12.

• Photo uploads must be scanned for malicious content. File type validation must be enforced on the server side; only JPEG, PNG, and WebP formats are permitted.

## Software Quality Attributes

| **Attribute** | **Requirement** |
| --- | --- |
| **Usability** | A new user with no prior experience must be able to discover and start a route within 3 minutes of first opening the app, as validated by usability testing with 5 representative users. |
| **Reliability** | The backend API must achieve at least 99.5% uptime over any 30-day period. Scheduled maintenance windows must not exceed 1 hour per month. |
| **Maintainability** | The codebase must follow Clean Architecture layering and SOLID principles. All modules must achieve at least 70% unit-test coverage. New features must be addable without modifying existing domain entities. |
| **Scalability** | The backend must be horizontally scalable - adding server instances must linearly increase throughput without requiring code changes. The database schema must support expansion to multiple cities without structural changes. |
| **Portability** | The mobile application must run identically on iOS 15+ and Android 9+ using a single shared codebase (React Native or Flutter). |
| **Testability** | All use-case (domain) logic must be fully unit-testable without network or database dependencies. Integration tests must cover all critical API endpoints. |
| **Accessibility** | The mobile UI must support dynamic text sizes (OS accessibility settings) and provide sufficient contrast ratios per WCAG 2.1 AA guidelines. |

## Business Rules

• Only accounts with the 'Admin' role may create, edit, or delete 'Official' routes.

• Only administrators may create or deactivate route categories.

• A user must be logged in to create routes, fork routes, rate routes, or save routes to collections.

• A route must contain a minimum of 2 stops to be published.

• Each user may submit at most one rating per route. Ratings cannot be changed after submission.

• Sponsored (business-promoted) stop placements may only be added by administrators on behalf of verified business partners.

• Free-tier users shall see at most one sponsored stop per route. Premium users shall see no sponsored content.

• A forked route must attribute the original route (original author name and route ID displayed on the detail screen).

• User location data collected during navigation must be anonymised within 1 hour of session end.

# Other Requirements

## Internationalisation

The mobile application must support Turkish (tr-TR) and English (en-US) languages. All user-facing strings must be externalised to locale resource files (no hardcoded strings). The user selects their preferred language during onboarding or from the profile screen. Date formats, number separators, and map labels must adapt to the selected locale.

7.2 Database Requirements

• The database schema must include the following core entities: User, Route, Stop, Category, Rating, Collection, RouteCollection (junction), HeatmapSnapshot.

• All primary keys must be UUIDs to support future distributed scaling.

• The database must enforce referential integrity via foreign-key constraints.

• The PostGIS extension must be enabled to store stop coordinates as geometric point types and to support spatial queries (e.g., radius search).

• All write operations must be wrapped in database transactions to ensure data consistency.

7.3 Legal & Compliance

• The system must display a privacy policy and terms of service at registration, and require explicit user acceptance before account creation.

• Location data collection must be gated behind an explicit in-app permission request aligned with iOS and Android OS permission frameworks.

• The system must provide a 'Delete My Account' function that permanently removes all personally identifiable information within 30 days of the request, in compliance with KVKK Article 7.

# References

Object-Oriented Software Engineering, Using UML, Patterns, and Java, 2nd Edition, by Bernd Bruegge and Allen H. Dutoit, Prentice-Hall, 2004, ISBN: 0-13-047110-0.

# Appendix A: Glossary

Route: A curated, ordered sequence of geographic stops (locations) that a user can browse, navigate, fork, or save within AntAPP. Routes may be Official (administrator-created), Community (user-created), or Sponsored (business-created).

Stop: An individual point of interest (location) within a route, identified by GPS coordinates and accompanied by a title, description, and optional photo.

Fork: The action of cloning an existing route to create a personal, editable copy. A forked route retains a reference to the original route (attribution) and is published as a new community route under the forking user's profile.

Official Route: A route created and verified by an AntAPP administrator. Official routes appear at the top of route listings and are marked with a verified badge in the mobile application.

Community Route: A route created and published by a standard user. Community routes are visible to all users and subject to administrator moderation.

Sponsored Route: A route created by a verified Business Account for promotional purposes. Sponsored routes are clearly labelled with a "Sponsored" badge in both list and map views.

Heatmap: A colour-coded overlay on the map view visualising the relative density of active AntAPP users in real time. High-density areas appear red, moderate areas orange, and low-density areas green.

Business Account: A verified account type in AntAPP for local businesses (restaurants, tour operators, hotels, etc.). Business accounts can create sponsored routes, promote venue pins, and access performance analytics.

MVP (Minimum Viable Product): The first public release of AntAPP containing only the core feature set required to satisfy early adopters and validate the product concept.

KVKK: Kisisel Verilerin Korunmasi Kanunu - the Turkish Personal Data Protection Law (Law No. 6698). AntAPP must comply with KVKK requirements for the collection, storage, and deletion of personal and location data.

Clean Architecture: A software design pattern that separates the codebase into concentric layers - Presentation, Domain (Use Cases), and Data - to maximise testability and maintainability.

PostGIS: An open-source extension for PostgreSQL that adds support for geographic objects (geometric point types, spatial indexing) and enables efficient geospatial queries such as radius searches.