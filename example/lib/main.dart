import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:fog_edge_blur/fog_edge_blur.dart';
import 'package:fog_edge_blur/fog_edge_child.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        backgroundColor: Colors.white,
        body: FogEdgeBlur(
          edgeAlign: EdgeAlign.top,
          fogEdgeChild: FogEdgeChild(
            heightEdge: 160,
            colorEdge: Colors.black.withValues(alpha: 0.4),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Container(
                    height: 50,
                    width: 50,
                    decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.6),
                        shape: BoxShape.circle
                    ),
                    child: Icon(Icons.arrow_back_ios_new, size: 20),
                  ),
                  const SizedBox(width: 30),
                  Text("Trip Journal", style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white
                  ))
                ],
              ),
            ),
          ),
          child: ListView(
            physics: BouncingScrollPhysics().applyTo(AlwaysScrollableScrollPhysics()),
            padding: EdgeInsets.only(top: 160).add(EdgeInsetsGeometry.symmetric(horizontal: 20)),
            children: [
              Container(
                decoration: BoxDecoration(
                    color: CupertinoColors.systemGrey6,
                    borderRadius: BorderRadius.circular(20)
                ),
                padding: EdgeInsets.all(8),
                child: Row(
                  children: [
                    Expanded(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                            color: Colors.grey.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(10)
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.timeline),
                              const SizedBox(width: 10),
                              Text("TimeLine"),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.history_edu),
                        const SizedBox(width: 10),
                        Text("Storymode"),
                      ],
                    )),
                  ],
                ),
              ),
              SizedBox(height: 20),
              itemDemo("https://resources.matcha-jp.com/resize/720x2000/2024/01/22-163214.webp"),
              itemDemo("https://cdn.tripspoint.com/uploads/photos/7325/taman-negara-day-tour-from-kuala-lumpur_58add.jpeg"),
              itemDemo("https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/canh-dep-5.jpg"),
              itemDemo("https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg"),
            ],
          ),
        ),
      ),
    );
  }

  Widget itemDemo(String url) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Stack(
        alignment: AlignmentGeometry.bottomRight,
        children: [
          Container(
            height: 300,
            width: double.infinity,
            padding: EdgeInsets.all(20),
            alignment: Alignment.bottomLeft,
            clipBehavior: Clip.hardEdge,
            decoration: BoxDecoration(
                image: DecorationImage(
                    image: NetworkImage(url),
                    fit: BoxFit.cover
                ),
                borderRadius: BorderRadius.circular(20)
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Daisen", style: TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold)),
                Text("tottori prefecture", style: TextStyle(color: Colors.white, fontSize: 18)),
                Row(
                  children: [
                    Icon(CupertinoIcons.map, color: Colors.white),
                    const SizedBox(width: 10),
                    Text("17Km from your location", style: TextStyle(color: Colors.white, fontSize: 18)),
                  ],
                ),
              ],
            ),
          ),
          Positioned(
            right: 20,
            bottom: 20,
            child: DecoratedBox(
              decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.4),
                  shape: BoxShape.circle
              ),
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Icon(Icons.favorite_border, size: 30, color: Colors.white),
              ),
            ),
          )
        ],
      ),
    );
  }
}
