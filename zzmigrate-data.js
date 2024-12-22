const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'test_pack_mod',
  password: ',4!J#&7X>u.O',
  database: 'test_pack_management_lama',
};

// Specify the path to data.json
const dataFilePath = path.join(__dirname, 'public', 'data', 'data.json');

// Read JSON data
let jsonData;
try {
  const rawData = fs.readFileSync(dataFilePath, 'utf8');
  jsonData = JSON.parse(rawData);
  console.log('Successfully read data.json file');
  console.log(
    'JSON Data Structure:',
    JSON.stringify(Object.keys(jsonData), null, 2)
  );
} catch (error) {
  console.error('Error reading or parsing data.json:', error);
  process.exit(1);
}

async function insertTags(connection, tags, testPackId) {
  for (const tag of tags) {
    try {
      // Insert tag if it doesn't exist
      await connection.execute(
        'INSERT IGNORE INTO tags (tag_name) VALUES (?)',
        [tag]
      );

      // Get the tag id
      const [rows] = await connection.execute(
        'SELECT id FROM tags WHERE tag_name = ?',
        [tag]
      );
      const tagId = rows[0].id;

      // Insert the association
      await connection.execute(
        'INSERT IGNORE INTO test_pack_tag_association (test_pack_id, tag_id) VALUES (?, ?)',
        [testPackId, tagId]
      );
    } catch (error) {
      console.error(
        `Error inserting tag ${tag} for test pack ${testPackId}:`,
        error.message
      );
    }
  }
  console.log(`Inserted tags for test pack ${testPackId}`);
}

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database successfully');

    // Migrate test packs
    const testPacks = jsonData.testPacks || [];
    for (const testPack of testPacks) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO test_packs (id, exam, test_pack_type, title, subtitle, test_pack_slug, is_premium, image_url, banner_image_url, icon_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            testPack.id,
            testPack.exam,
            testPack.testPackType,
            testPack.title,
            testPack.subtitle,
            testPack.testPackSlug,
            testPack.isPremium,
            testPack.image,
            testPack.bannerImage,
            testPack.icon,
          ]
        );
        console.log(`Inserted test pack: ${testPack.title}`);

        await insertTags(connection, testPack.tags, testPack.id);

        // Insert modules
        if (testPack.modules) {
          for (const module of testPack.modules) {
            const [moduleResult] = await connection.execute(
              'INSERT INTO modules (test_pack_id, module_name) VALUES (?, ?)',
              [testPack.id, module.moduleName]
            );
            const moduleId = moduleResult.insertId;
            console.log(`Inserted module: ${module.moduleName}`);

            // Insert topics
            if (module.moduleTopics) {
              for (const topic of module.moduleTopics) {
                const [topicResult] = await connection.execute(
                  'INSERT INTO topics (module_id, topic_name, topic_slug) VALUES (?, ?, ?)',
                  [moduleId, topic.topicName, topic.topicSlug]
                );
                const topicId = topicResult.insertId;
                console.log(`Inserted topic: ${topic.topicName}`);

                // Insert topic tests
                if (topic.topicTests) {
                  for (const test of topic.topicTests) {
                    await connection.execute(
                      'INSERT INTO tests (test_type, test_id, test_name, test_slug, difficulty, number_of_questions, topic_id, test_pack_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                      [
                        'topicTest',
                        test.topicTestId,
                        test.topicTestName,
                        test.topicTestSlug,
                        test.difficulty,
                        test.number_of_questions,
                        topicId,
                        testPack.id,
                      ]
                    );
                    console.log(`Inserted topic test: ${test.topicTestName}`);
                  }
                }
              }
            }

            // Insert module tests
            if (module.moduleTests) {
              for (const test of module.moduleTests) {
                await connection.execute(
                  'INSERT INTO tests (test_type, test_id, test_name, test_slug, difficulty, number_of_questions, module_id, test_pack_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                  [
                    'moduleTest',
                    test.moduleTestId,
                    test.moduleTestName,
                    test.moduleTestSlug,
                    test.difficulty,
                    test.number_of_questions,
                    moduleId,
                    testPack.id,
                  ]
                );
                console.log(`Inserted module test: ${test.moduleTestName}`);
              }
            }
          }
        }

        // Insert section tests
        if (testPack.sections) {
          for (const section of testPack.sections) {
            if (section.sectionTests) {
              for (const test of section.sectionTests) {
                await connection.execute(
                  'INSERT INTO tests (test_type, test_id, test_name, test_slug, difficulty, number_of_questions, test_pack_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [
                    'sectionTest',
                    test.sectionTestId,
                    test.sectionTestName,
                    test.sectionTestSlug,
                    test.difficulty,
                    test.number_of_questions,
                    testPack.id,
                  ]
                );
                console.log(`Inserted section test: ${test.sectionTestName}`);
              }
            }
          }
        }

        // Insert full length tests
        if (testPack.fullLengthTests) {
          for (const test of testPack.fullLengthTests) {
            await connection.execute(
              'INSERT INTO tests (test_type, test_id, test_name, test_slug, difficulty, number_of_questions, test_pack_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [
                'fullLengthTest',
                test.fullLengthTestId,
                test.fullLengthTestName,
                test.fullLengthTestSlug,
                test.difficulty,
                test.number_of_questions,
                testPack.id,
              ]
            );
            console.log(
              `Inserted full length test: ${test.fullLengthTestName}`
            );
          }
        }
      } catch (error) {
        console.error(
          `Error processing test pack ${testPack.title}:`,
          error.message
        );
      }
    }

    // Migrate test bundles
    const testBundles = jsonData.testPackBundles || [];
    for (const bundle of testBundles) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO test_bundles (id, exam, bundle_name, bundle_slug, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
          [
            bundle.id,
            bundle.exam,
            bundle.bundleName,
            bundle.bundleSlug,
            bundle.description,
            bundle.image,
          ]
        );
        console.log(`Inserted bundle: ${bundle.bundleName}`);

        // Insert bundle-test pack relationships
        for (const testPackId of bundle.testPacks) {
          try {
            await connection.execute(
              'INSERT IGNORE INTO bundle_test_pack_association (bundle_id, test_pack_id) VALUES (?, ?)',
              [bundle.id, testPackId]
            );
          } catch (error) {
            console.error(
              `Error associating test pack ${testPackId} with bundle ${bundle.id}:`,
              error.message
            );
          }
        }
        console.log(`Inserted relationships for bundle: ${bundle.bundleName}`);
      } catch (error) {
        console.error(
          `Error processing bundle ${bundle.bundleName}:`,
          error.message
        );
      }
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

migrate();
