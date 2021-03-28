const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');
const app = express();


const authors = [
    {id: 1, name: 'J. K. Rowling'},
    {id: 2, name: 'J. R. R. Tolkien'},
    {id: 3, name: 'Brent Weeks'},
];

const books = [
    {id: 1, name: 'Harry Potter Chapter 1', authorId: 1},
    {id: 2, name: 'Harry Potter Chapter 2', authorId: 1},
    {id: 3, name: 'Harry Potter Chapter 3', authorId: 1},
    {id: 4, name: 'HThe fellowship of the ring', authorId: 2},
    {id: 5, name: 'the two tower', authorId: 2},
    {id: 6, name: 'The return of the king', authorId: 2},
    {id: 7, name: 'The way of shadows', authorId: 3},
    {id: 8, name: 'Beyond the shadows', authorId: 3},
];

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author name',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt) },
        name: {type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => books.filter(book => book.authorId === author.id)
        }
    })
})
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString) },
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single book',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'Single author',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString) },
                authorId: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                };
                books.push(book);

                return book;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: {type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                };
                authors.push(author);

                return author;
            }
        },
        updateAuthor: {
            type: AuthorType,
            description: 'Update an author',
            args: {
                id: {type: GraphQLInt},
                name: {type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                authors.forEach(
                    author => {
                        if (author.id !== args.id) return;
                        author.name = args.name
                    }
                )
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use(
    '/graphql',
    graphqlHTTP({
        schema,
        graphiql: true,
    }),
);
app.listen(5000., () => console.log('Server Running'))