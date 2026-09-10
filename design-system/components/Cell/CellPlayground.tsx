import { useState } from "react";
import { CellLeftAccessory, type CellLeftAccessoryKind } from "@components/CellLeftAccessory";
import { CellRightAccessory, type CellRightAccessoryKind } from "@components/CellRightAccessory";
import { Cell, type CellTextScale, type CellVerticalSpacing } from "./Cell";
import styles from "./CellPlayground.module.css";

const textScales: CellTextScale[] = ["5XL", "4XL", "3XL", "2XL", "XL", "L", "M", "S", "XS"];

const verticalSpacings: CellVerticalSpacing[] = ["default", "compact", "none"];

const leftKinds: CellLeftAccessoryKind[] = [
  "Avatar",
  "Icon30",
  "Icon24",
  "Icon18",
  "CardPreview",
  "AvatarCheckbox",
  "AddButton",
];

const rightKinds: CellRightAccessoryKind[] = [
  "AvatarM",
  "AvatarS",
  "Icon30",
  "Icon24",
  "Icon18",
  "Spinner34AvatarS",
  "Spinner24",
  "Checkbox",
  "Radio",
  "Switcher",
  "Disclosure",
  "TextLDisclosure",
  "TextSDisclosure",
  "CounterDisclosure",
  "Counter",
  "NotificationIndicator",
  "TextL",
  "TextM",
  "TextS",
  "TextMTextXs",
  "TableTextMTextM",
  "TableTextSTextS",
  "Icon24Icon24",
  "TextMIcon30",
  "TextMIcon24",
  "TextMIcon18",
  "Stepper",
];

function InteractiveRight({ kind }: { kind: CellRightAccessoryKind }) {
  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState(0);
  if (kind === "Checkbox" || kind === "Radio" || kind === "Switcher") {
    return <CellRightAccessory kind={kind} checked={checked} onCheckedChange={setChecked} />;
  }
  if (kind === "Stepper") {
    return <CellRightAccessory kind={kind} value={value} onStep={(d) => setValue((v) => v + d)} />;
  }
  if (kind === "Counter" || kind === "CounterDisclosure") {
    return <CellRightAccessory kind={kind} value={value} />;
  }
  return <CellRightAccessory kind={kind} />;
}

export function CellPlayground() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Cell (TextCells)</h2>

      <h3 className={styles.subheading}>Размеры текста (Cell, аксессуары Disclosure)</h3>
      <div className={styles.grid}>
        {textScales.map((scale) => (
          <div key={scale} className={styles.cellWrap}>
            <Cell
              textScale={scale}
              title={`Text ${scale}`}
              leftAccessory={<CellLeftAccessory kind="Icon24" />}
              rightAccessory={<CellRightAccessory kind="Disclosure" />}
            />
          </div>
        ))}
      </div>

      <h3 className={styles.subheading}>Вертикальные отступы (XL)</h3>
      <div className={styles.grid}>
        {verticalSpacings.map((v) => (
          <div key={v} className={styles.cellWrap}>
            <Cell
              textScale="XL"
              verticalSpacing={v}
              title={`Vertical: ${v}`}
              leftAccessory={<CellLeftAccessory kind="Icon24" />}
              rightAccessory={<CellRightAccessory kind="Disclosure" />}
            />
          </div>
        ))}
      </div>

      <h3 className={styles.subheading}>Подзаголовок и описание (XL)</h3>
      <div className={styles.cellWrap}>
        <Cell
          textScale="XL"
          title="Text XL"
          subtitle="Text S"
          description="Text S"
          leftAccessory={<CellLeftAccessory kind="Avatar" />}
          rightAccessory={<CellRightAccessory kind="Disclosure" />}
        />
      </div>

      <h3 className={styles.subheading}>Bullet (XL)</h3>
      <div className={styles.cellWrap}>
        <Cell textScale="XL" layoutVariant="bullet" title="Text XL" />
      </div>

      <h3 className={styles.subheading}>Horizontal spacing (XL)</h3>
      <div className={styles.grid}>
        {(["on", "off"] as const).map((h) => (
          <div key={h} className={styles.cellWrap}>
            <Cell
              textScale="XL"
              horizontalSpacing={h}
              title={`Horizontal: ${h}`}
              leftAccessory={<CellLeftAccessory kind="Icon24" />}
              rightAccessory={<CellRightAccessory kind="Disclosure" />}
            />
          </div>
        ))}
      </div>

      <h3 className={styles.subheading}>Left Accessory</h3>
      <div className={styles.row}>
        {leftKinds.map((kind) => (
          <div key={kind} className={styles.accessoryTile}>
            <CellLeftAccessory kind={kind} />
            <span className={styles.label}>{kind}</span>
          </div>
        ))}
      </div>

      <h3 className={styles.subheading}>Right Accessory</h3>
      <div className={styles.row}>
        {rightKinds.map((kind) => (
          <div key={kind} className={styles.accessoryTile}>
            <InteractiveRight kind={kind} />
            <span className={styles.label}>{kind}</span>
          </div>
        ))}
      </div>

      <h3 className={styles.subheading}>Комбинации (сводка)</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Scale</th>
            <th>Vertical</th>
            <th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {(["XL", "M", "XS"] as const).flatMap((scale) =>
            verticalSpacings.map((v) => (
              <tr key={`${scale}-${v}`}>
                <td>{scale}</td>
                <td>{v}</td>
                <td>
                  <div className={styles.cellWrap}>
                    <Cell
                      textScale={scale}
                      verticalSpacing={v}
                      title={`${scale} / ${v}`}
                      leftAccessory={<CellLeftAccessory kind="Icon18" />}
                      rightAccessory={<CellRightAccessory kind="Disclosure" />}
                    />
                  </div>
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </section>
  );
}
