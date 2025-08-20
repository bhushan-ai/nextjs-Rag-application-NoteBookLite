# NotebookLite: RAG Application with Next.js

NotebookLite is a lightweight Retrieval-Augmented Generation (RAG) application built with Next.js. It allows users to interact with their data through a chat interface, supporting text, PDF, and URL inputs. The application utilizes Qdrant for vector storage and Google Generative AI embeddings for semantic understanding.

## Features

-**Multi-input Support**: Accepts text, PDF, and URL inputs for data processing.
-**Semantic Search**: Utilizes Google Generative AI embeddings for understanding and retrieving relevant information.
-**Chat Interface**: Engages users in a conversational manner, providing responses based on the provided data.
-**Persistent Storage**: Stores user messages locally for a seamless chat experience.

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Qdrant, Google Generative AI
- **Libraries**: Langchain, Axios

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bhushan-ai/nextjs-Rag-application-NoteBookLite.git
   cd nextjs-Rag-application-NoteBookLite

2. Install dependencies:

   ```bash
   npm install


3. Set up environment variables:
````
   Create a `.env.local` file in the root directory and add the following:

   ```env
   GEMINI_API_KEY=your_google_genai_api_key
   QDRANT_CLUSTER_URL=your_qdrant_cluster_url
   CLUSTER_API_KEY=your_qdrant_api_key

4. Run the development server:

1. Clone the repository:

   ```bash
   git clone https://github.com/bhushan-ai/nextjs-Rag-application-NoteBookLite.git
   cd nextjs-Rag-application-NoteBookLite
````

2. Install dependencies:

   ```bash
   npm install


3. Set up environment variables:
````
   Create a `.env.local` file in the root directory and add the following:

   ```env
   GEMINI_API_KEY=your_google_genai_api_key
   QDRANT_CLUSTER_URL=your_qdrant_cluster_url
   CLUSTER_API_KEY=your_qdrant_api_key
   ```

4. Run the development server:
````
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.
````
## Usage
````
* **Text Input**: Enter your data directly into the text area and submit.
* **PDF Input**: Upload a PDF file containing your data.
* **URL Input**: Provide a URL pointing to the data you wish to use.

The application will process the input and provide relevant responses based on the provided data.

## Contributing

Contributions are welcome! Please fork th
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.
````
````## Usage
````
* **Text Input**: Enter your data directly into the text area and submit.
* **PDF Input**: Upload a PDF file containing your data.
* **URL Input**: Provide a URL pointing to the data you wish to use.

The application will process the input and provide relevant responses based on the provided data.

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

