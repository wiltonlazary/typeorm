# Find Options

* [Basic options](#basic-options)
* [Advanced options](#advanced-options)

## Basic options

All repository and manager `find` methods accept special options you can use to query data you need without using `QueryBuilder`:

* `select` - indicates which properties of the main object must be selected

```typescript
userRepository.find({ select: ["firstName", "lastName"] });
```

* `relations` - relations needs to be loaded with the main entity. Sub-relations can also be loaded (shorthand for join and leftJoinAndSelect)

```typescript
userRepository.find({ relations: ["profile", "photos", "videos"] });
userRepository.find({ relations: ["profile", "photos", "videos", "videos.video_attributes"] });
```

* `join` - joins needs to be performed for the entity. Extended version of "relations".

```typescript
userRepository.find({ 
    join: {
        alias: "user",
        leftJoinAndSelect: {
            profile: "user.profile",
            photo: "user.photos",
            video: "user.videos"
        }
    }
});
```

* `where` - simple conditions by which entity should be queried.

```typescript
userRepository.find({ where: { firstName: "Timber", lastName: "Saw" } });
```
Querying a column from an embedded entity should be done with respect to the hierarchy in which it was defined. Example: 

```typescript
userRepository.find({ where: { name: { first: "Timber", last: "Saw" } } });
```

* `order` - selection order.

```typescript
userRepository.find({ 
    order: {
        name: "ASC",
        id: "DESC"
    }
});
```

`find` methods which return multiple entities (`find`, `findAndCount`, `findByIds`) also accept following options:

* `skip` - offset (paginated) from where entities should be taken.

```typescript
userRepository.find({ 
    skip: 5
});
```

* `take` - limit (paginated) - max number of entities that should be taken.

```typescript
userRepository.find({ 
    take: 10
});
```

** If you are using typeorm with MSSQL, and want to use `take` or `limit`, you need to use order as well or you will receive the following error:   `'Invalid usage of the option NEXT in the FETCH statement.'`

```typescript
userRepository.find({ 
    order: { 
        columnName: 'ASC' 
        }, 
    skip: 0, 
    take: 10 
})
```



* `cache` - Enables or disables query result caching. See [caching](caching.md) for more information and options.

```typescript
userRepository.find({
    cache: true
})
```

Complete example of find options:

```typescript
userRepository.find({ 
    select: ["firstName", "lastName"],
    relations: ["profile", "photos", "videos"],
    where: { 
        firstName: "Timber", 
        lastName: "Saw" 
    },
    order: {
        name: "ASC",
        id: "DESC"
    },
    skip: 5,
    take: 10,
    cache: true
});
```


## Advanced options

TypeORM provides a lot of built-in operators that can be used to create more complex comparisons:

* `Not`

```ts
import {Not} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    title: Not("About #1")
})
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE "title" != 'About #1'
```

* `LessThan`

```ts
import {LessThan} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    likes: LessThan(10)
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE "likes" < 10
```

* `MoreThan`

```ts
import {MoreThan} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    likes: MoreThan(10)
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE "likes" > 10
```

* `Equal`

```ts
import {Equal} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    title: Equal("About #2")
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE "title" = 'About #2'
```

* `Like`

```ts
import {Like} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    title: Like("%out #%")
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE "title" LIKE '%out #%'
```

* `Between`

```ts
import {Between} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    likes: Between(1, 10)
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE "likes" BETWEEN 1 AND 10
```

* `In`

```ts
import {In} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    title: In(["About #2", "About #3"])
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE "title" IN ('About #2','About #3')
```

* `Any`

```ts
import {Any} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    title: Any(["About #2", "About #3"])
});
```

will execute following query (Postgres notation): 

```sql
SELECT * FROM "post" WHERE "title" = ANY(['About #2','About #3'])
```

* `IsNull`

```ts
import {IsNull} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    title: IsNull()
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE "title" IS NULL
```

* `Raw`

```ts
import {Raw} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    likes: Raw( "1 + likes = 4")
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE 1 + "likes" = 4
```

> Note: beware with `Raw` operator. It executes pure SQL from supplied expression and should not contain a user input,
 otherwise it will lead to SQL-injection.

Also you can combine these operators with `Not` operator:

```ts
import {Not, MoreThan, Equal} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    likes: Not(MoreThan(10)),
    title: Not(Equal("About #2"))
});
```

will execute following query: 

```sql
SELECT * FROM "post" WHERE NOT("likes" > 10) AND NOT("title" = 'About #2')
```
