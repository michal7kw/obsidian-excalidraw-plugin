# Mermaid Test Diagrams

Test diagrams for verifying Mermaid-to-Excalidraw script compatibility.
Copy one diagram at a time to `to_convert.md` and run the script.

---

## 1. Flowchart (Native Excalidraw elements)

```mermaid
graph LR
    A[Start] --> B[End]
```

---

## 2. Sequence Diagram

```mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob
    Bob-->>Alice: Hi Alice
```

---

## 3. Class Diagram

```mermaid
classDiagram
    Animal <|-- Duck
    Animal: +int age
    Duck: +swim()
```

---

## 4. State Diagram

```mermaid
stateDiagram-v2
    [*] --> Active
    Active --> [*]
```

---

## 5. Pie Chart

```mermaid
pie title Pets
    "Dogs" : 45
    "Cats" : 30
    "Birds" : 25
```

---

## 6. Mindmap

```mermaid
mindmap
  root((Main))
    Topic A
    Topic B
```

---

## Verification Results (2026-01-24)

| Diagram Type | Status |
|--------------|--------|
| Flowchart | ✓ Native elements |
| Sequence Diagram | ✓ Image |
| Class Diagram | ✓ Image |
| State Diagram | ✓ Image |
| Pie Chart | ✓ Image |
| Mindmap | ✓ Image |
